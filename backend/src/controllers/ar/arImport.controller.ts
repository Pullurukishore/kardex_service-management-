import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logInvoiceActivity, getUserFromRequest, getIpFromRequest } from './arActivityLog.controller';
import { calculateDaysBetween, calculateRiskClass } from '../../utils/dateUtils';

import prisma from '../../config/db';


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
            let value = row[key];
            // Sanitization: Prevent CSV/Formula Injection
            // If the value starts with risky characters, prepend a single quote
            if (typeof value === 'string' && /^[=+\-@]/.test(value)) {
                value = `'${value}`;
            }
            return value;
        }
    }
    return null;
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

        // Potential Resource Exhaustion Check (Hole #3)
        const MAX_ROWS = 5000;
        if (rows.length > MAX_ROWS) {
            return res.status(400).json({
                success: false,
                message: 'File too large',
                details: `The file contains ${rows.length} rows, which exceeds the limit of ${MAX_ROWS} per import.`
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
        const user = getUserFromRequest(req);
        const ipAddress = getIpFromRequest(req);
        const userAgent = req.headers['user-agent'] || null;

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

        // Potential Resource Exhaustion Check (Hole #3)
        const MAX_ROWS = 5000;
        if (rows.length > MAX_ROWS) {
            return res.status(400).json({
                success: false,
                message: 'File too large',
                details: `The file contains ${rows.length} rows, which exceeds the limit of ${MAX_ROWS} per import.`
            });
        }

        // Phase 1: Validate all rows and prepare data (outside transaction)
        const validRows: Array<{
            rowNumber: number;
            invoiceNumber: string;
            bpCode: string;
            customerName: string;
            poNo: string | null;
            totalAmount: number;
            netAmount: number;
            taxAmount: number;
            invoiceDate: Date;
            finalDueDate: Date;
            dueByDays: number;
            riskClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
            balance: number;
        }> = [];
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2; // Excel rows are 1-indexed, plus header row

            // Extract mandatory fields with flexible column name matching
            const invoiceNumber = getValue(row, 'Doc. No.', 'Doc No', 'DocNo', 'Invoice No', 'InvoiceNo')?.toString()?.trim();
            const bpCode = getValue(row, 'Customer Code', 'CustomerCode', 'BP Code', 'BPCode')?.toString()?.trim();
            const customerName = getValue(row, 'Customer Name', 'CustomerName')?.toString()?.trim();
            const poNo = getValue(row, 'Customer Ref. No.', 'Customer Ref No', 'CustomerRefNo', 'PO No', 'PONo')?.toString()?.trim();
            const totalAmount = parseDecimal(getValue(row, 'Amount', 'Total Amount', 'TotalAmount'));
            const netAmount = parseDecimal(getValue(row, 'Net', 'Net Amount', 'NetAmount'));
            const taxAmount = parseDecimal(getValue(row, 'Tax', 'Tax Amount', 'TaxAmount'));
            const invoiceDate = parseExcelDate(getValue(row, 'Document Date', 'DocumentDate', 'Invoice Date', 'InvoiceDate'));

            // Validate mandatory fields
            if (!invoiceNumber) {
                errors.push(`Row ${rowNumber}: Missing Doc. No. (Invoice Number)`);
                continue;
            }
            if (!bpCode) {
                errors.push(`Row ${rowNumber}: Missing Customer Code (BP Code)`);
                continue;
            }
            if (!customerName) {
                errors.push(`Row ${rowNumber}: Missing Customer Name`);
                continue;
            }
            if (!invoiceDate) {
                errors.push(`Row ${rowNumber}: Missing or invalid Document Date`);
                continue;
            }

            // Calculate due date (30 days from invoice date)
            const finalDueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            const dueByDays = calculateDaysBetween(finalDueDate);
            const riskClass = calculateRiskClass(dueByDays);
            const balance = totalAmount;

            validRows.push({
                rowNumber,
                invoiceNumber,
                bpCode,
                customerName,
                poNo: poNo || null,
                totalAmount,
                netAmount,
                taxAmount,
                invoiceDate,
                finalDueDate,
                dueByDays,
                riskClass,
                balance
            });
        }

        const failedCount = errors.length;
        let successCount = 0;
        const importedInvoices: Array<{ id: string; invoiceNumber: string; totalAmount: number; rowNumber: number }> = [];

        // Phase 2: Execute all upserts in a single transaction for atomicity
        if (validRows.length > 0) {
            try {
                await prisma.$transaction(async (tx) => {
                    for (const row of validRows) {
                        const upsertedInvoice = await tx.aRInvoice.upsert({
                            where: { invoiceNumber: row.invoiceNumber },
                            create: {
                                invoiceNumber: row.invoiceNumber,
                                bpCode: row.bpCode,
                                customerName: row.customerName,
                                poNo: row.poNo,
                                totalAmount: row.totalAmount,
                                netAmount: row.netAmount,
                                taxAmount: row.taxAmount,
                                invoiceDate: row.invoiceDate,
                                dueDate: row.finalDueDate,
                                balance: row.balance,
                                riskClass: row.riskClass,
                                dueByDays: row.dueByDays,
                                status: row.dueByDays > 0 ? 'OVERDUE' : 'PENDING'
                            },
                            update: {
                                bpCode: row.bpCode,
                                customerName: row.customerName,
                                poNo: row.poNo,
                                totalAmount: row.totalAmount,
                                netAmount: row.netAmount,
                                taxAmount: row.taxAmount,
                                invoiceDate: row.invoiceDate,
                                dueDate: row.finalDueDate,
                                riskClass: row.riskClass,
                                dueByDays: row.dueByDays,
                                status: row.dueByDays > 0 ? 'OVERDUE' : 'PENDING'
                            }
                        });
                        importedInvoices.push({
                            id: upsertedInvoice.id,
                            invoiceNumber: row.invoiceNumber,
                            totalAmount: row.totalAmount,
                            rowNumber: row.rowNumber
                        });
                    }
                }, { timeout: 60000 }); // 60 second timeout for large imports

                successCount = importedInvoices.length;
            } catch (txError: any) {
                // Transaction failed - all upserts rolled back
                errors.push(`Transaction failed: ${txError.message}`);
                // All valid rows failed due to transaction rollback
                for (const row of validRows) {
                    errors.push(`Row ${row.rowNumber}: Rolled back due to transaction failure`);
                }
            }
        }

        // Phase 3: Log activity for imported invoices (outside transaction - non-critical)
        for (const inv of importedInvoices) {
            await logInvoiceActivity({
                invoiceId: inv.id,
                action: 'INVOICE_IMPORTED',
                description: `Invoice ${inv.invoiceNumber} imported from SAP Excel - Amount: ₹${inv.totalAmount.toLocaleString()}`,
                performedById: user.id,
                performedBy: user.name || 'System Import',
                ipAddress,
                userAgent,
                metadata: { fileName, rowNumber: inv.rowNumber, source: 'SAP_IMPORT' }
            });
        }

        // Log import history
        await prisma.aRImportHistory.create({
            data: {
                fileName,
                recordsCount: rows.length,
                successCount,
                failedCount: rows.length - successCount,
                importedBy: (req as any).user?.name || 'System',
                status: successCount === rows.length ? 'COMPLETED' : successCount === 0 ? 'FAILED' : 'PARTIAL',
                errorLog: errors.length > 0 ? errors.slice(0, 50).join('\n') : null
            }
        });

        return res.status(200).json({
            message: `Import completed: ${successCount} records imported, ${rows.length - successCount} failed`,
            total: rows.length,
            success: successCount,
            failed: rows.length - successCount,
            errors: errors.slice(0, 20)
        });

    } catch (error: any) {

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
            'Document Date'
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
            { wch: 15 }  // Document Date
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'AR Import Template');

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="AR_Import_Template.xlsx"');
        res.send(buffer);

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: 'Failed to generate template',
            error: error.message
        });
    }
};

/**
 * Recalculate all invoice balances and risk classes
 * Uses cursor-based pagination and batched transactions for consistency and performance
 */
export const recalculateAll = async (req: Request, res: Response) => {
    try {
        const FETCH_BATCH_SIZE = 500; // Fetch invoices in batches to avoid memory issues
        const UPDATE_BATCH_SIZE = 100;
        let updatedCount = 0;
        let cursor: string | undefined = undefined;
        let hasMore = true;

        while (hasMore) {
            // Fetch invoices in batches using cursor pagination
            const invoices: {
                id: string;
                receipts: any;
                adjustments: any;
                totalAmount: any;
                dueDate: Date;
            }[] = await prisma.aRInvoice.findMany({
                take: FETCH_BATCH_SIZE,
                ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
                orderBy: { id: 'asc' },
                select: {
                    id: true,
                    receipts: true,
                    adjustments: true,
                    totalAmount: true,
                    dueDate: true
                }
            });

            if (invoices.length === 0) {
                hasMore = false;
                break;
            }

            // Update cursor for next iteration
            cursor = invoices[invoices.length - 1].id;
            hasMore = invoices.length === FETCH_BATCH_SIZE;

            // Prepare update data for this batch
            const updateData = invoices.map(invoice => {
                const receipts = Number(invoice.receipts) || 0;
                const adjustments = Number(invoice.adjustments) || 0;
                const totalReceipts = receipts + adjustments;
                const balance = Number(invoice.totalAmount) - totalReceipts;
                const dueByDays = calculateDaysBetween(invoice.dueDate);
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

                return {
                    id: invoice.id,
                    totalReceipts,
                    balance,
                    dueByDays,
                    riskClass,
                    status
                };
            });

            // Process updates in smaller batches within transactions
            for (let i = 0; i < updateData.length; i += UPDATE_BATCH_SIZE) {
                const batch = updateData.slice(i, i + UPDATE_BATCH_SIZE);

                await prisma.$transaction(
                    batch.map((data: { id: string; totalReceipts: number; balance: number; dueByDays: number; riskClass: any; status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED' }) =>
                        prisma.aRInvoice.update({
                            where: { id: data.id },
                            data: {
                                totalReceipts: data.totalReceipts,
                                balance: data.balance,
                                dueByDays: data.dueByDays,
                                riskClass: data.riskClass,
                                status: data.status
                            }
                        })
                    )
                );

                updatedCount += batch.length;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Recalculated ${updatedCount} invoices`,
            data: { updatedCount }
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: 'Failed to recalculate invoices',
            error: error.message
        });
    }
};
