import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../../uploads/ar');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `ar_import_${timestamp}${path.extname(file.originalname)}`);
    }
});

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * SAP Excel Column Mapping (Mandatory Green Fields):
 * A: Doc. No.        → invoiceNumber
 * C: Customer Code   → bpCode
 * D: Customer Name   → customerName
 * F: Customer Ref No → poNo
 * H: Amount          → totalAmount
 * I: Net             → netAmount
 * J: Tax             → taxAmount
 * M: Document Date   → invoiceDate
 */
interface SAPImportRow {
    [key: string]: any;
}

// Helper function to parse Excel date
function parseExcelDate(value: any): Date | null {
    if (!value) return null;

    // If it's already a Date object
    if (value instanceof Date) return value;

    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + value * 86400000);
    }

    // If it's a string, try to parse it
    if (typeof value === 'string') {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) return parsed;

        // Try DD/MM/YYYY format
        const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
            return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
        }

        // Try YYYY-MM-DD format
        const yyyymmdd = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (yyyymmdd) {
            return new Date(parseInt(yyyymmdd[1]), parseInt(yyyymmdd[2]) - 1, parseInt(yyyymmdd[3]));
        }
    }

    return null;
}

// Helper function to parse decimal values
function parseDecimal(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        // Remove currency symbols and commas
        const cleaned = value.replace(/[₹$€£,\s]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

// Helper function to get value from multiple possible column names
function getValue(row: SAPImportRow, ...keys: string[]): any {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return row[key];
        }
    }
    return null;
}

// Calculate risk class based on days overdue
function calculateRiskClass(dueByDays: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (dueByDays <= 0) return 'LOW';
    if (dueByDays <= 30) return 'MEDIUM';
    if (dueByDays <= 90) return 'HIGH';
    return 'CRITICAL';
}

// Calculate due by days
function calculateDueByDays(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Validate a single row and return field-level errors
function validateRow(row: SAPImportRow, rowNumber: number): { isValid: boolean; errors: { field: string; message: string }[] } {
    const errors: { field: string; message: string }[] = [];

    const invoiceNumber = getValue(row, 'Doc. No.', 'Doc No', 'DocNo', 'Invoice No', 'InvoiceNo')?.toString()?.trim();
    const bpCode = getValue(row, 'Customer Code', 'CustomerCode', 'BP Code', 'BPCode')?.toString()?.trim();
    const customerName = getValue(row, 'Customer Name', 'CustomerName')?.toString()?.trim();
    const totalAmount = getValue(row, 'Amount', 'Total Amount', 'TotalAmount');
    const netAmount = getValue(row, 'Net', 'Net Amount', 'NetAmount');
    const invoiceDate = getValue(row, 'Document Date', 'DocumentDate', 'Invoice Date', 'InvoiceDate');

    if (!invoiceNumber) {
        errors.push({ field: 'Doc. No.', message: 'Missing invoice number (Doc. No.)' });
    }

    if (!bpCode) {
        errors.push({ field: 'Customer Code', message: 'Missing customer code (BP Code)' });
    }

    if (!customerName) {
        errors.push({ field: 'Customer Name', message: 'Missing customer name' });
    }

    if (totalAmount === null || totalAmount === undefined || totalAmount === '') {
        errors.push({ field: 'Amount', message: 'Missing total amount' });
    } else if (isNaN(parseDecimal(totalAmount))) {
        errors.push({ field: 'Amount', message: 'Invalid amount format' });
    }

    if (netAmount === null || netAmount === undefined || netAmount === '') {
        errors.push({ field: 'Net', message: 'Missing net amount' });
    } else if (isNaN(parseDecimal(netAmount))) {
        errors.push({ field: 'Net', message: 'Invalid net amount format' });
    }

    if (!invoiceDate) {
        errors.push({ field: 'Document Date', message: 'Missing document date' });
    } else if (!parseExcelDate(invoiceDate)) {
        errors.push({ field: 'Document Date', message: 'Invalid date format' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Preview Excel file before importing (shows ALL rows with validation)
 */
export const previewExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
                details: 'Please select an Excel file (.xlsx or .xls) to upload'
            });
        }

        let workbook;
        try {
            // Read file from buffer (memoryStorage)
            workbook = XLSX.read(req.file.buffer, { cellDates: true });
        } catch (parseError: any) {
            return res.status(400).json({
                success: false,
                message: 'Failed to read Excel file',
                details: 'The file appears to be corrupted or is not a valid Excel file',
                error: parseError.message
            });
        }

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No worksheets found',
                details: 'The Excel file does not contain any worksheets'
            });
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
            return res.status(400).json({
                success: false,
                message: 'Empty worksheet',
                details: `The worksheet "${sheetName}" is empty or could not be read`
            });
        }

        // Convert to JSON with headers
        let rows: SAPImportRow[];
        try {
            rows = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
        } catch (convError: any) {
            return res.status(400).json({
                success: false,
                message: 'Failed to parse worksheet data',
                details: 'Could not convert the Excel data to a readable format',
                error: convError.message
            });
        }

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No data rows found',
                details: 'The Excel file has headers but no data rows. Please add invoice data below the header row.'
            });
        }

        // Get headers from the first row
        const headers = Object.keys(rows[0]);

        // Check for required columns
        const requiredColumns = ['Doc. No.', 'Customer Code', 'Customer Name', 'Amount', 'Net', 'Document Date'];
        const possibleHeaders: { [key: string]: string[] } = {
            'Doc. No.': ['Doc. No.', 'Doc No', 'DocNo', 'Invoice No', 'InvoiceNo'],
            'Customer Code': ['Customer Code', 'CustomerCode', 'BP Code', 'BPCode'],
            'Customer Name': ['Customer Name', 'CustomerName'],
            'Amount': ['Amount', 'Total Amount', 'TotalAmount'],
            'Net': ['Net', 'Net Amount', 'NetAmount'],
            'Document Date': ['Document Date', 'DocumentDate', 'Invoice Date', 'InvoiceDate']
        };

        const missingColumns: string[] = [];
        for (const reqCol of requiredColumns) {
            const possibleNames = possibleHeaders[reqCol];
            const found = headers.some(h => possibleNames.some(p => h.toLowerCase().includes(p.toLowerCase())));
            if (!found) {
                missingColumns.push(reqCol);
            }
        }

        // Validate ALL rows and add validation info
        const validatedRows = rows.map((row, index) => {
            const validation = validateRow(row, index + 2);
            return {
                ...row,
                _rowNumber: index + 2, // Excel row number (1-indexed + header)
                _isValid: validation.isValid,
                _errors: validation.errors
            };
        });

        const validRowsCount = validatedRows.filter(r => r._isValid).length;
        const invalidRowsCount = validatedRows.filter(r => !r._isValid).length;

        // Return ALL rows for full preview
        return res.status(200).json({
            success: true,
            headers,
            preview: validatedRows,
            totalRows: rows.length,
            validRows: validRowsCount,
            invalidRows: invalidRowsCount,
            missingColumns: missingColumns.length > 0 ? missingColumns : undefined,
            sheetName
        });

    } catch (error: any) {
        console.error('Preview error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to preview file',
            details: 'An unexpected error occurred while reading the file',
            error: error.message
        });
    }
};

/**
 * Import AR Invoices from SAP Excel file
 */
export const importFromExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileName = req.file.originalname;

        // Read the Excel file from buffer (memoryStorage)
        const workbook = XLSX.read(req.file.buffer, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const rows: SAPImportRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Excel file is empty or has no valid data'
            });
        }

        let successCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2; // Excel rows are 1-indexed, plus header row

            try {
                // Extract mandatory fields with flexible column name matching
                const invoiceNumber = getValue(row, 'Doc. No.', 'Doc No', 'DocNo', 'Invoice No', 'InvoiceNo')?.toString()?.trim();
                const bpCode = getValue(row, 'Customer Code', 'CustomerCode', 'BP Code', 'BPCode')?.toString()?.trim();
                const customerName = getValue(row, 'Customer Name', 'CustomerName')?.toString()?.trim();
                const poNo = getValue(row, 'Customer Ref. No.', 'Customer Ref No', 'CustomerRefNo', 'PO No', 'PONo')?.toString()?.trim();
                const totalAmount = parseDecimal(getValue(row, 'Amount', 'Total Amount', 'TotalAmount'));
                const netAmount = parseDecimal(getValue(row, 'Net', 'Net Amount', 'NetAmount'));
                const taxAmount = parseDecimal(getValue(row, 'Tax', 'Tax Amount', 'TaxAmount'));
                const invoiceDate = parseExcelDate(getValue(row, 'Document Date', 'DocumentDate', 'Invoice Date', 'InvoiceDate'));
                const dueDate = parseExcelDate(getValue(row, 'Due Date', 'DueDate'));

                // Validate mandatory fields
                if (!invoiceNumber) {
                    errors.push(`Row ${rowNumber}: Missing Doc. No. (Invoice Number)`);
                    failedCount++;
                    continue;
                }

                if (!bpCode) {
                    errors.push(`Row ${rowNumber}: Missing Customer Code (BP Code)`);
                    failedCount++;
                    continue;
                }

                if (!customerName) {
                    errors.push(`Row ${rowNumber}: Missing Customer Name`);
                    failedCount++;
                    continue;
                }

                if (!invoiceDate) {
                    errors.push(`Row ${rowNumber}: Missing or invalid Document Date`);
                    failedCount++;
                    continue;
                }

                // Calculate due date if not provided (default: 30 days from invoice date)
                const finalDueDate = dueDate || new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

                // Calculate due by days and risk class
                const dueByDays = calculateDueByDays(finalDueDate);
                const riskClass = calculateRiskClass(dueByDays);

                // Calculate balance (totalAmount - totalReceipts, initially totalAmount)
                const balance = totalAmount;

                // Upsert invoice (insert or update based on invoice number)
                await prisma.aRInvoice.upsert({
                    where: { invoiceNumber },
                    create: {
                        invoiceNumber,
                        bpCode,
                        customerName,
                        poNo: poNo || null,
                        totalAmount,
                        netAmount,
                        taxAmount,
                        invoiceDate,
                        dueDate: finalDueDate,
                        balance,
                        riskClass,
                        dueByDays,
                        status: dueByDays > 0 ? 'OVERDUE' : 'PENDING'
                    },
                    update: {
                        bpCode,
                        customerName,
                        poNo: poNo || null,
                        totalAmount,
                        netAmount,
                        taxAmount,
                        invoiceDate,
                        dueDate: finalDueDate,
                        riskClass,
                        dueByDays,
                        status: dueByDays > 0 ? 'OVERDUE' : 'PENDING'
                    }
                });

                successCount++;
            } catch (error: any) {
                errors.push(`Row ${rowNumber}: ${error.message}`);
                failedCount++;
            }
        }

        // Log import history
        await prisma.aRImportHistory.create({
            data: {
                fileName,
                recordsCount: rows.length,
                successCount,
                failedCount,
                importedBy: (req as any).user?.name || 'System',
                status: failedCount === 0 ? 'COMPLETED' : failedCount === rows.length ? 'FAILED' : 'PARTIAL',
                errorLog: errors.length > 0 ? errors.slice(0, 50).join('\n') : null
            }
        });

        return res.status(200).json({
            message: `Import completed: ${successCount} records imported, ${failedCount} failed`,
            total: rows.length,
            success: successCount,
            failed: failedCount,
            errors: errors.slice(0, 20)
        });

    } catch (error: any) {
        console.error('Import error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to import file',
            error: error.message
        });
    }
};

/**
 * Get import history
 */
export const getImportHistory = async (req: Request, res: Response) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const [history, total] = await Promise.all([
            prisma.aRImportHistory.findMany({
                orderBy: { importedAt: 'desc' },
                take: Number(limit),
                skip: Number(offset)
            }),
            prisma.aRImportHistory.count()
        ]);

        return res.status(200).json({
            success: true,
            data: history,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset)
            }
        });

    } catch (error: any) {
        console.error('Get import history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch import history',
            error: error.message
        });
    }
};

/**
 * Download import template (empty with headers only)
 */
export const downloadTemplate = async (req: Request, res: Response) => {
    try {
        // Create headers only - no sample data
        const headers = [
            'Doc. No.',
            'Customer Code',
            'Customer Name',
            'Customer Ref. No.',
            'Amount',
            'Net',
            'Tax',
            'Document Date',
            'Due Date'
        ];

        // Create workbook with empty data but headers
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headers]);

        // Set column widths
        worksheet['!cols'] = [
            { wch: 15 }, // Doc. No.
            { wch: 15 }, // Customer Code
            { wch: 30 }, // Customer Name
            { wch: 18 }, // Customer Ref. No.
            { wch: 15 }, // Amount
            { wch: 15 }, // Net
            { wch: 12 }, // Tax
            { wch: 15 }, // Document Date
            { wch: 15 }  // Due Date
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'AR Import Template');

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="AR_Import_Template.xlsx"');
        res.send(buffer);

    } catch (error: any) {
        console.error('Download template error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate template',
            error: error.message
        });
    }
};

/**
 * Recalculate all invoice balances and risk classes
 */
export const recalculateAll = async (req: Request, res: Response) => {
    try {
        const invoices = await prisma.aRInvoice.findMany();

        let updatedCount = 0;

        for (const invoice of invoices) {
            const receipts = Number(invoice.receipts) || 0;
            const adjustments = Number(invoice.adjustments) || 0;
            const totalReceipts = receipts + adjustments;
            const balance = Number(invoice.totalAmount) - totalReceipts;
            const dueByDays = calculateDueByDays(invoice.dueDate);
            const riskClass = calculateRiskClass(dueByDays);

            // Determine status
            let status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED' = 'PENDING';
            if (balance <= 0) {
                status = 'PAID';
            } else if (totalReceipts > 0) {
                status = 'PARTIAL';
            } else if (dueByDays > 0) {
                status = 'OVERDUE';
            }

            await prisma.aRInvoice.update({
                where: { id: invoice.id },
                data: {
                    totalReceipts,
                    balance,
                    dueByDays,
                    riskClass,
                    status
                }
            });

            updatedCount++;
        }

        return res.status(200).json({
            success: true,
            message: `Recalculated ${updatedCount} invoices`,
            data: { updatedCount }
        });

    } catch (error: any) {
        console.error('Recalculate error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to recalculate invoices',
            error: error.message
        });
    }
};
