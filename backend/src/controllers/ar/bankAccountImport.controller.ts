import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import prisma from '../../config/db';

interface BankAccountImportRow {
    [key: string]: any;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getValue(row: BankAccountImportRow, ...keys: string[]): any {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return row[key].toString().trim();
        }
    }
    return null;
}

function validateRow(row: BankAccountImportRow, index: number) {
    const errors: { field: string; message: string }[] = [];

    const vendorName = getValue(row, 'Vendor Name', 'VendorName', 'Vendor');
    const bankName = getValue(row, 'Bank Name', 'BankName', 'Bank', 'Beneficiary Bank Name');
    const accountNumber = getValue(row, 'Account Number', 'AccountNumber', 'Account No', 'Account');
    const ifscCode = getValue(row, 'IFSC Code', 'IFSC', 'IFSCCode');

    if (!vendorName) errors.push({ field: 'Vendor Name', message: 'Missing vendor name' });
    if (!bankName) errors.push({ field: 'Bank Name', message: 'Missing bank name' });
    if (!accountNumber) errors.push({ field: 'Account Number', message: 'Missing account number' });
    if (!ifscCode) errors.push({ field: 'IFSC Code', message: 'Missing IFSC code' });

    return {
        isValid: errors.length === 0,
        errors,
        data: {
            vendorName,
            beneficiaryBankName: bankName,
            accountNumber,
            ifscCode,
            beneficiaryName: getValue(row, 'Beneficiary Name', 'BeneficiaryName') || vendorName,
            emailId: getValue(row, 'Email', 'EmailId', 'Email ID'),
            nickName: getValue(row, 'Nick Name', 'NickName', 'Alias')
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Preview Excel file for Bank Accounts
 */
export const previewExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: BankAccountImportRow[] = XLSX.utils.sheet_to_json(worksheet);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Worksheet is empty' });
        }

        const MAX_ROWS = 5000;
        if (rows.length > MAX_ROWS) {
            return res.status(400).json({
                error: 'File too large',
                message: `The file contains ${rows.length} rows, which exceeds the limit of ${MAX_ROWS} per import.`
            });
        }

        const previewData = rows.map((row, index) => {
            const validation = validateRow(row, index);
            const previewRow: any = {
                ...row,
                _rowNumber: index + 2,
                _isValid: validation.isValid,
                _errors: validation.errors,
                _parsed: validation.data
            };
            return previewRow;
        });

        // Check for duplicate account numbers within the file itself
        const accMap = new Map();
        previewData.forEach((row: any) => {
            const acc = row._parsed.accountNumber;
            if (acc) {
                if (accMap.has(acc)) {
                    row._isValid = false;
                    row._errors.push({ field: 'Account Number', message: 'Duplicate account number in file' });
                } else {
                    accMap.set(acc, true);
                }
            }
        });

        // Check against database
        const accountNumbers = previewData.map((r: any) => r._parsed.accountNumber).filter(Boolean);
        const existingAccounts = await prisma.bankAccount.findMany({
            where: { accountNumber: { in: accountNumbers } },
            select: { accountNumber: true }
        });
        const existingSet = new Set(existingAccounts.map((a: { accountNumber: string }) => a.accountNumber));

        previewData.forEach((row: any) => {
            if (existingSet.has(row._parsed.accountNumber)) {
                row._isUpdate = true;
                row._statusText = 'UPDATE';
            } else {
                row._isUpdate = false;
                row._statusText = 'NEW';
            }
        });

        res.json({
            success: true,
            totalRows: rows.length,
            validRows: previewData.filter(r => r._isValid).length,
            invalidRows: previewData.filter(r => !r._isValid).length,
            preview: previewData
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to preview file', message: error.message });
    }
};

/**
 * Bulk Import Bank Accounts
 */
export const importFromExcel = async (req: Request, res: Response) => {
    try {
        const { rows: selectedRows } = req.body;
        const userId = (req as any).user?.id || 1;

        if (!selectedRows || !Array.isArray(selectedRows) || selectedRows.length === 0) {
            return res.status(400).json({ error: 'No valid rows selected for import' });
        }

        const results = await prisma.$transaction(async (tx: any) => {
            const processed = [];
            for (const row of selectedRows) {
                const account = await tx.bankAccount.upsert({
                    where: { accountNumber: row.accountNumber },
                    create: {
                        vendorName: row.vendorName,
                        beneficiaryBankName: row.beneficiaryBankName,
                        accountNumber: row.accountNumber,
                        ifscCode: row.ifscCode,
                        beneficiaryName: row.beneficiaryName,
                        emailId: row.emailId || null,
                        nickName: row.nickName || null,
                        createdById: userId,
                        updatedById: userId
                    },
                    update: {
                        vendorName: row.vendorName,
                        beneficiaryBankName: row.beneficiaryBankName,
                        ifscCode: row.ifscCode,
                        beneficiaryName: row.beneficiaryName,
                        emailId: row.emailId || null,
                        nickName: row.nickName || null,
                        updatedById: userId
                    }
                });
                processed.push(account);
            }
            return processed;
        });

        res.json({
            success: true,
            message: `Successfully processed ${results.length} vendor accounts (Add/Update)`,
            count: results.length
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Import failed during processing', message: error.message });
    }
};

/**
 * Download Template
 */
export const downloadTemplate = async (req: Request, res: Response) => {
    try {
        const headers = [
            'Vendor Name',
            'Bank Name',
            'Account Number',
            'IFSC Code',
            'Beneficiary Name',
            'Email',
            'Nick Name'
        ];

        const sampleData = [
            ['Example Vendor Ltd', 'HDFC Bank', '50100123456789', 'HDFC0001234', 'Example Vendor Ltd', 'finance@example.com', 'Primary Account']
        ];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

        // Column widths
        worksheet['!cols'] = [
            { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor Accounts Template');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Vendor_Accounts_Import_Template.xlsx"');
        res.send(buffer);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to generate template' });
    }
};
