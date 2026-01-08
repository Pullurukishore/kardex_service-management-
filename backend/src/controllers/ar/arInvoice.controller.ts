import { Request, Response } from 'express';
import { ARInvoiceStatus } from '@prisma/client';
import prisma from '../../config/db';

// Get all invoices with filters
export const getAllInvoices = async (req: Request, res: Response) => {
    try {
        const {
            search,
            status,
            customerId,
            fromDate,
            toDate,
            overdueOnly,
            page = 1,
            limit = 20
        } = req.query;

        const where: any = {};

        if (search) {
            where.OR = [
                { invoiceNumber: { contains: String(search), mode: 'insensitive' } },
                { bpCode: { contains: String(search), mode: 'insensitive' } },
                { customerName: { contains: String(search), mode: 'insensitive' } },
                { poNo: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (customerId) {
            where.bpCode = customerId;
        }

        if (fromDate || toDate) {
            where.invoiceDate = {};
            if (fromDate) where.invoiceDate.gte = new Date(String(fromDate));
            if (toDate) where.invoiceDate.lte = new Date(String(toDate));
        }

        if (overdueOnly === 'true') {
            where.status = 'OVERDUE';
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [invoices, total] = await Promise.all([
            prisma.aRInvoice.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { invoiceDate: 'desc' }
            }),
            prisma.aRInvoice.count({ where })
        ]);

        // Calculate days overdue for each invoice
        const invoicesWithOverdue = invoices.map(invoice => {
            const today = new Date();
            const dueDate = new Date(invoice.dueDate);
            const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

            return {
                ...invoice,
                daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
                isOverdue: daysOverdue > 0
            };
        });

        res.json({
            data: invoicesWithOverdue,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Error fetching AR invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices', message: error.message });
    }
};

// Get invoice by ID or Invoice Number with full details
export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Try to find by UUID first, then by invoice number
        let invoice = await prisma.aRInvoice.findUnique({
            where: { id }
        });

        // If not found by UUID, try by invoice number
        if (!invoice) {
            invoice = await prisma.aRInvoice.findUnique({
                where: { invoiceNumber: id }
            });
        }

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Fetch payment history
        const paymentHistory = await prisma.aRPaymentHistory.findMany({
            where: { invoiceId: invoice.id },
            orderBy: { paymentDate: 'desc' }
        });

        // Calculate days overdue
        const today = new Date();
        const dueDate = new Date(invoice.dueDate);
        const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        const isOverdue = daysOverdue > 0 && invoice.status !== 'PAID';

        res.json({
            ...invoice,
            paymentHistory,
            daysOverdue,
            isOverdue
        });
    } catch (error: any) {
        console.error('Error fetching AR invoice:', error);
        res.status(500).json({ error: 'Failed to fetch invoice', message: error.message });
    }
};

// Add payment record
export const addPaymentRecord = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, paymentDate, paymentMode, referenceNo, notes } = req.body;

        const invoice = await prisma.aRInvoice.findUnique({ where: { id } });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Create payment record
        const payment = await prisma.aRPaymentHistory.create({
            data: {
                invoiceId: id,
                amount: parseFloat(amount),
                paymentDate: new Date(paymentDate),
                paymentMode,
                referenceNo,
                notes
            }
        });

        // Update invoice totals
        const receipts = Number(invoice.receipts || 0);
        const adjustments = Number(invoice.adjustments || 0);

        let newReceipts = receipts;
        let newAdjustments = adjustments;

        if (paymentMode === 'ADJUSTMENT' || paymentMode === 'CREDIT_NOTE') {
            newAdjustments += parseFloat(amount);
        } else {
            newReceipts += parseFloat(amount);
        }

        const totalReceipts = newReceipts + newAdjustments;
        const balance = Number(invoice.totalAmount) - totalReceipts;

        let status = invoice.status;
        if (balance <= 0) status = 'PAID';
        else if (totalReceipts > 0) status = 'PARTIAL';

        // Update invoice
        await prisma.aRInvoice.update({
            where: { id },
            data: {
                receipts: newReceipts,
                adjustments: newAdjustments,
                totalReceipts,
                balance,
                status
            }
        });

        res.json(payment);
    } catch (error: any) {
        console.error('Error adding payment record:', error);
        res.status(500).json({ error: 'Failed to add payment', message: error.message });
    }
};

// Create invoice
export const createInvoice = async (req: Request, res: Response) => {
    try {
        const {
            invoiceNumber,
            docNo,
            installmentNo,
            soNo,
            poNo,
            customerRefNo,
            customerId,
            paymentTermsId,
            productId,
            invoiceDate,
            documentDate,
            postingDate,
            dueDate,
            totalAmount,
            netAmount,
            taxAmount,
            originalAmount,
            amountReceived,
            actualPaymentTerms
        } = req.body;

        if (!invoiceNumber || !customerId || !invoiceDate || !dueDate || !totalAmount) {
            return res.status(400).json({
                error: 'Invoice Number, Customer, Invoice Date, Due Date, and Total Amount are required'
            });
        }

        const paymentPending = parseFloat(totalAmount) - (parseFloat(amountReceived) || 0);

        let status: ARInvoiceStatus = 'PENDING';
        if (paymentPending <= 0) {
            status = 'PAID';
        } else if (parseFloat(amountReceived) > 0) {
            status = 'PARTIAL';
        } else if (new Date(dueDate) < new Date()) {
            status = 'OVERDUE';
        }

        const invoice = await prisma.aRInvoice.create({
            data: {
                invoiceNumber,
                bpCode: customerId,
                customerName: req.body.customerName || '',
                poNo,
                invoiceDate: new Date(invoiceDate),
                dueDate: new Date(dueDate),
                totalAmount: parseFloat(totalAmount),
                netAmount: netAmount ? parseFloat(netAmount) : parseFloat(totalAmount),
                taxAmount: taxAmount ? parseFloat(taxAmount) : null,
                actualPaymentTerms,
                status
            }
        });

        res.status(201).json(invoice);
    } catch (error: any) {
        console.error('Error creating AR invoice:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Invoice with this number already exists' });
        }
        res.status(500).json({ error: 'Failed to create invoice', message: error.message });
    }
};

// Update invoice
export const updateInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Convert date strings to Date objects
        if (updateData.dueDate) {
            updateData.dueDate = new Date(updateData.dueDate);
        }
        if (updateData.invoiceDate) {
            updateData.invoiceDate = new Date(updateData.invoiceDate);
        }
        if (updateData.sentHandoverDate) {
            updateData.sentHandoverDate = new Date(updateData.sentHandoverDate);
        }
        if (updateData.impactDate) {
            updateData.impactDate = new Date(updateData.impactDate);
        }

        // Convert numeric strings to numbers
        if (updateData.receipts !== undefined) {
            updateData.receipts = parseFloat(updateData.receipts) || 0;
        }
        if (updateData.adjustments !== undefined) {
            updateData.adjustments = parseFloat(updateData.adjustments) || 0;
        }
        if (updateData.totalReceipts !== undefined) {
            updateData.totalReceipts = parseFloat(updateData.totalReceipts) || 0;
        }
        if (updateData.balance !== undefined) {
            updateData.balance = parseFloat(updateData.balance) || 0;
        }

        // Recalculate balance and status if amounts changed
        if (updateData.totalAmount !== undefined || updateData.totalReceipts !== undefined) {
            const existingInvoice = await prisma.aRInvoice.findUnique({ where: { id } });
            if (existingInvoice) {
                const totalAmount = updateData.totalAmount !== undefined
                    ? parseFloat(updateData.totalAmount)
                    : Number(existingInvoice.totalAmount);
                const totalReceipts = updateData.totalReceipts !== undefined
                    ? parseFloat(updateData.totalReceipts)
                    : Number(existingInvoice.totalReceipts || 0);

                updateData.balance = totalAmount - totalReceipts;

                if (updateData.balance <= 0) {
                    updateData.status = 'PAID';
                } else if (totalReceipts > 0) {
                    updateData.status = 'PARTIAL';
                }
            }
        }

        const invoice = await prisma.aRInvoice.update({
            where: { id },
            data: updateData
        });

        res.json(invoice);
    } catch (error: any) {
        console.error('Error updating AR invoice:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.status(500).json({ error: 'Failed to update invoice', message: error.message });
    }
};

// Update delivery tracking (updates delivery fields on the invoice directly)
export const updateDeliveryTracking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { deliveryStatus, modeOfDelivery, sentHandoverDate, impactDate } = req.body;

        const invoice = await prisma.aRInvoice.update({
            where: { id },
            data: {
                deliveryStatus,
                modeOfDelivery,
                sentHandoverDate: sentHandoverDate ? new Date(sentHandoverDate) : null,
                impactDate: impactDate ? new Date(impactDate) : null
            }
        });

        res.json(invoice);
    } catch (error: any) {
        console.error('Error updating AR delivery tracking:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.status(500).json({ error: 'Failed to update delivery tracking', message: error.message });
    }
};

// Delete invoice
export const deleteInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.aRInvoice.delete({
            where: { id }
        });

        res.json({ message: 'Invoice deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting AR invoice:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.status(500).json({ error: 'Failed to delete invoice', message: error.message });
    }
};

// Update overdue status for all invoices (batch job)
export const updateOverdueStatus = async (req: Request, res: Response) => {
    try {
        const today = new Date();

        // Update status to OVERDUE for past due invoices that aren't paid
        const result = await prisma.aRInvoice.updateMany({
            where: {
                dueDate: { lt: today },
                status: { in: ['PENDING', 'PARTIAL'] }
            },
            data: {
                status: 'OVERDUE'
            }
        });

        res.json({ message: `Updated ${result.count} invoices to OVERDUE status` });
    } catch (error: any) {
        console.error('Error updating AR overdue status:', error);
        res.status(500).json({ error: 'Failed to update overdue status', message: error.message });
    }
};
