import { Request, Response } from 'express';
import prisma from '../../config/db';
import { calculateDaysBetween } from '../../utils/dateUtils';

/**
 * Get AR Aging Report
 */
export const getAgingReport = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const invoices = await prisma.aRInvoice.findMany({
            where: { status: { not: 'PAID' } },
            select: {
                invoiceNumber: true,
                bpCode: true,
                customerName: true,
                totalAmount: true,
                balance: true,
                dueDate: true,
                riskClass: true,
                invoiceDate: true
            }
        });

        const report = invoices.map(inv => {
            const daysOverdue = calculateDaysBetween(inv.dueDate, today);
            return {
                ...inv,
                daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
                agingBucket:
                    daysOverdue <= 0 ? 'Current' :
                        daysOverdue <= 30 ? '1-30 Days' :
                            daysOverdue <= 60 ? '31-60 Days' :
                                daysOverdue <= 90 ? '61-90 Days' : 'Over 90 Days'
            };
        });

        res.json(report);
    } catch (error: any) {

        res.status(500).json({ error: 'Failed to generate aging report' });
    }
};

/**
 * Get Collection Efficiency Report
 */
export const getCollectionEfficiency = async (req: Request, res: Response) => {
    try {
        const { fromDate, toDate } = req.query;
        const where: any = {};
        if (fromDate || toDate) {
            where.paymentDate = {};
            if (fromDate) where.paymentDate.gte = new Date(String(fromDate));
            if (toDate) where.paymentDate.lte = new Date(String(toDate));
        }

        const payments = await prisma.aRPaymentHistory.findMany({
            where,
            orderBy: { paymentDate: 'desc' }
        });

        res.json(payments);
    } catch (error: any) {

        res.status(500).json({ error: 'Failed to generate collection report' });
    }
};
