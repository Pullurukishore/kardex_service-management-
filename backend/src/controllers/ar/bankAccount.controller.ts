import { Request, Response } from 'express';
import prisma from '../../config/db';

// ═══════════════════════════════════════════════════════════════════════════
// BANK ACCOUNT CRUD OPERATIONS
// Only FINANCE_ADMIN can directly create/update/delete
// FINANCE_USER can only view and must use change requests
// ═══════════════════════════════════════════════════════════════════════════

// Get all bank accounts
export const getAllBankAccounts = async (req: Request, res: Response) => {
    try {
        const { search, activeOnly } = req.query;

        const where: any = {};

        if (activeOnly === 'true') {
            where.isActive = true;
        }

        if (search) {
            where.OR = [
                { vendorName: { contains: String(search), mode: 'insensitive' } },
                { nickName: { contains: String(search), mode: 'insensitive' } },
                { accountNumber: { contains: String(search), mode: 'insensitive' } },
                { beneficiaryBankName: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        const accounts = await prisma.bankAccount.findMany({
            where,
            orderBy: { vendorName: 'asc' },
            include: {
                _count: {
                    select: { changeRequests: true }
                }
            }
        });

        res.json(accounts);
    } catch (error: any) {
        console.error('Error fetching bank accounts:', error);
        res.status(500).json({ error: 'Failed to fetch bank accounts', message: error.message });
    }
};

// Get bank account by ID
export const getBankAccountById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const account = await prisma.bankAccount.findUnique({
            where: { id },
            include: {
                changeRequests: {
                    orderBy: { requestedAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        res.json(account);
    } catch (error: any) {
        console.error('Error fetching bank account:', error);
        res.status(500).json({ error: 'Failed to fetch bank account', message: error.message });
    }
};

// Create bank account (FINANCE_ADMIN only)
export const createBankAccount = async (req: Request, res: Response) => {
    try {
        const { vendorName, beneficiaryBankName, accountNumber, ifscCode, emailId, nickName } = req.body;
        const userId = (req as any).user?.id || 1; // Get from auth context

        // Validate required fields
        if (!vendorName || !beneficiaryBankName || !accountNumber || !ifscCode) {
            return res.status(400).json({
                error: 'Vendor Name, Beneficiary Bank Name, Account Number, and IFSC Code are required'
            });
        }

        // Check for duplicate account number
        const existing = await prisma.bankAccount.findUnique({
            where: { accountNumber }
        });

        if (existing) {
            return res.status(400).json({ error: 'An account with this account number already exists' });
        }

        const account = await prisma.bankAccount.create({
            data: {
                vendorName,
                beneficiaryBankName,
                accountNumber,
                ifscCode,
                emailId: emailId || null,
                nickName: nickName || null,
                createdById: userId,
                updatedById: userId
            }
        });

        res.status(201).json(account);
    } catch (error: any) {
        console.error('Error creating bank account:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Account number already exists' });
        }
        res.status(500).json({ error: 'Failed to create bank account', message: error.message });
    }
};

// Update bank account (FINANCE_ADMIN only)
export const updateBankAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id || 1;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.createdById;
        delete updateData.createdAt;

        // Check if account exists
        const existing = await prisma.bankAccount.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        // Check for duplicate account number if being updated
        if (updateData.accountNumber && updateData.accountNumber !== existing.accountNumber) {
            const duplicate = await prisma.bankAccount.findUnique({
                where: { accountNumber: updateData.accountNumber }
            });
            if (duplicate) {
                return res.status(400).json({ error: 'Account number already exists' });
            }
        }

        const account = await prisma.bankAccount.update({
            where: { id },
            data: {
                ...updateData,
                updatedById: userId
            }
        });

        res.json(account);
    } catch (error: any) {
        console.error('Error updating bank account:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Bank account not found' });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Account number already exists' });
        }
        res.status(500).json({ error: 'Failed to update bank account', message: error.message });
    }
};

// Delete bank account (soft delete - FINANCE_ADMIN only)
export const deleteBankAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id || 1;

        const existing = await prisma.bankAccount.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        // Soft delete by setting isActive to false
        const account = await prisma.bankAccount.update({
            where: { id },
            data: {
                isActive: false,
                updatedById: userId
            }
        });

        res.json({ message: 'Bank account deleted successfully', account });
    } catch (error: any) {
        console.error('Error deleting bank account:', error);
        res.status(500).json({ error: 'Failed to delete bank account', message: error.message });
    }
};

// Hard delete (permanent - FINANCE_ADMIN only)
export const permanentDeleteBankAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.bankAccount.delete({
            where: { id }
        });

        res.json({ message: 'Bank account permanently deleted' });
    } catch (error: any) {
        console.error('Error permanently deleting bank account:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Bank account not found' });
        }
        res.status(500).json({ error: 'Failed to delete bank account', message: error.message });
    }
};
