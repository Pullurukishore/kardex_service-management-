import { Request, Response } from 'express';
import prisma from '../../config/db';
import { Prisma } from '@prisma/client';

// Get dashboard KPIs
export const getDashboardKPIs = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Total Outstanding (sum of balance for pending/partial/overdue invoices)
        const totalOutstanding = await prisma.aRInvoice.aggregate({
            where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
            _sum: { balance: true }
        });

        // Overdue Amount
        const overdueAmount = await prisma.aRInvoice.aggregate({
            where: { status: 'OVERDUE' },
            _sum: { balance: true }
        });

        // Today's Collections (invoices updated to PAID today - sum of totalReceipts)
        const collectionsToday = await prisma.aRInvoice.aggregate({
            where: {
                status: 'PAID',
                updatedAt: { gte: startOfDay, lte: endOfDay }
            },
            _sum: { totalReceipts: true }
        });

        // Pending Invoices Count
        const pendingCount = await prisma.aRInvoice.count({
            where: { status: { in: ['PENDING', 'PARTIAL'] } }
        });

        // Overdue Count
        const overdueCount = await prisma.aRInvoice.count({
            where: { status: 'OVERDUE' }
        });

        res.json({
            totalOutstanding: totalOutstanding._sum?.balance || 0,
            overdueAmount: overdueAmount._sum?.balance || 0,
            collectionsToday: collectionsToday._sum?.totalReceipts || 0,
            pendingInvoices: pendingCount,
            overdueInvoices: overdueCount
        });
    } catch (error: any) {
        console.error('Error fetching AR dashboard KPIs:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data', message: error.message });
    }
};

// Get aging analysis
export const getAgingAnalysis = async (req: Request, res: Response) => {
    try {
        const today = new Date();

        const invoices = await prisma.aRInvoice.findMany({
            where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
            select: {
                dueDate: true,
                balance: true
            }
        });

        const aging = {
            current: { count: 0, amount: 0 },      // Not yet due
            days1to30: { count: 0, amount: 0 },    // 1-30 days overdue
            days31to60: { count: 0, amount: 0 },   // 31-60 days overdue
            days61to90: { count: 0, amount: 0 },   // 61-90 days overdue
            over90: { count: 0, amount: 0 }        // 90+ days overdue
        };

        for (const inv of invoices) {
            const daysOverdue = Math.floor(
                (today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            const amount = Number(inv.balance) || 0;

            if (daysOverdue <= 0) {
                aging.current.count++;
                aging.current.amount += amount;
            } else if (daysOverdue <= 30) {
                aging.days1to30.count++;
                aging.days1to30.amount += amount;
            } else if (daysOverdue <= 60) {
                aging.days31to60.count++;
                aging.days31to60.amount += amount;
            } else if (daysOverdue <= 90) {
                aging.days61to90.count++;
                aging.days61to90.amount += amount;
            } else {
                aging.over90.count++;
                aging.over90.amount += amount;
            }
        }

        res.json(aging);
    } catch (error: any) {
        console.error('Error fetching AR aging analysis:', error);
        res.status(500).json({ error: 'Failed to fetch aging analysis', message: error.message });
    }
};

// Get collection trend (last 6 months)
export const getCollectionTrend = async (req: Request, res: Response) => {
    try {
        const months = 6;
        const trend: { month: string; amount: number }[] = [];

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

            const collections = await prisma.aRInvoice.aggregate({
                where: {
                    status: 'PAID',
                    updatedAt: { gte: startOfMonth, lte: endOfMonth }
                },
                _sum: { totalReceipts: true }
            });

            trend.push({
                month: startOfMonth.toLocaleString('default', { month: 'short' }),
                amount: Number(collections._sum?.totalReceipts) || 0
            });
        }

        res.json(trend);
    } catch (error: any) {
        console.error('Error fetching AR collection trend:', error);
        res.status(500).json({ error: 'Failed to fetch collection trend', message: error.message });
    }
};

// Get critical overdue invoices
export const getCriticalOverdue = async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 10;

        const invoices = await prisma.aRInvoice.findMany({
            where: { status: 'OVERDUE' },
            orderBy: { dueDate: 'asc' },
            take: limit,
            select: {
                id: true,
                invoiceNumber: true,
                customerName: true,
                balance: true,
                dueDate: true,
                riskClass: true
            }
        });

        const result = invoices.map(inv => {
            const daysOverdue = Math.floor(
                (new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                customerName: inv.customerName,
                amount: inv.balance,
                daysOverdue,
                riskClass: inv.riskClass
            };
        });

        res.json(result);
    } catch (error: any) {
        console.error('Error fetching AR critical overdue:', error);
        res.status(500).json({ error: 'Failed to fetch critical overdue', message: error.message });
    }
};

// Define type for customer grouping
interface CustomerOutstandingGroup {
    id: string;
    bpCode: string;
    customerName: string;
    riskClass: string;
    totalOutstanding: number;
    invoiceCount: number;
}

// Get customer-wise outstanding (grouped by bpCode from invoices)
export const getCustomerOutstanding = async (req: Request, res: Response) => {
    try {
        // Get all outstanding invoices grouped by customer
        const invoices = await prisma.aRInvoice.findMany({
            where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
            select: {
                id: true,
                bpCode: true,
                customerName: true,
                balance: true,
                riskClass: true
            }
        });

        // Group by bpCode
        const customerMap = new Map<string, CustomerOutstandingGroup>();

        for (const inv of invoices) {
            const existing = customerMap.get(inv.bpCode);
            if (existing) {
                existing.totalOutstanding += Number(inv.balance || 0);
                existing.invoiceCount++;
                // Keep the highest risk class
                if (inv.riskClass === 'CRITICAL' ||
                    (inv.riskClass === 'HIGH' && existing.riskClass !== 'CRITICAL') ||
                    (inv.riskClass === 'MEDIUM' && existing.riskClass === 'LOW')) {
                    existing.riskClass = inv.riskClass;
                }
            } else {
                customerMap.set(inv.bpCode, {
                    id: inv.id,
                    bpCode: inv.bpCode,
                    customerName: inv.customerName,
                    riskClass: inv.riskClass,
                    totalOutstanding: Number(inv.balance || 0),
                    invoiceCount: 1
                });
            }
        }

        const result = Array.from(customerMap.values())
            .filter((c: CustomerOutstandingGroup) => c.invoiceCount > 0)
            .sort((a: CustomerOutstandingGroup, b: CustomerOutstandingGroup) => b.totalOutstanding - a.totalOutstanding);

        res.json(result);
    } catch (error: any) {
        console.error('Error fetching AR customer outstanding:', error);
        res.status(500).json({ error: 'Failed to fetch customer outstanding', message: error.message });
    }
};

// Get recent activity (last 10 invoice updates)
export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 10;

        const invoices = await prisma.aRInvoice.findMany({
            orderBy: { updatedAt: 'desc' },
            take: limit,
            select: {
                id: true,
                invoiceNumber: true,
                customerName: true,
                totalAmount: true,
                status: true,
                updatedAt: true
            }
        });

        const result = invoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            amount: inv.totalAmount,
            status: inv.status,
            updatedAt: inv.updatedAt,
            action: inv.status === 'PAID' ? 'Payment Received' :
                inv.status === 'PARTIAL' ? 'Partial Payment' :
                    inv.status === 'OVERDUE' ? 'Marked Overdue' : 'Invoice Updated'
        }));

        res.json(result);
    } catch (error: any) {
        console.error('Error fetching AR recent activity:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity', message: error.message });
    }
};

// Define type for top customers
interface TopCustomerGroup {
    id: string;
    bpCode: string;
    customerName: string;
    riskClass: string;
    totalOutstanding: number;
    invoiceCount: number;
    overdueCount: number;
}

// Get top customers by outstanding amount
export const getTopCustomers = async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 5;

        const invoices = await prisma.aRInvoice.findMany({
            where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
            select: {
                id: true,
                bpCode: true,
                customerName: true,
                balance: true,
                status: true,
                riskClass: true
            }
        });

        // Group by bpCode
        const customerMap = new Map<string, TopCustomerGroup>();

        for (const inv of invoices) {
            const existing = customerMap.get(inv.bpCode);
            if (existing) {
                existing.totalOutstanding += Number(inv.balance || 0);
                existing.invoiceCount++;
                if (inv.status === 'OVERDUE') {
                    existing.overdueCount++;
                }
                // Keep the highest risk class
                if (inv.riskClass === 'CRITICAL' ||
                    (inv.riskClass === 'HIGH' && existing.riskClass !== 'CRITICAL') ||
                    (inv.riskClass === 'MEDIUM' && existing.riskClass === 'LOW')) {
                    existing.riskClass = inv.riskClass;
                }
            } else {
                customerMap.set(inv.bpCode, {
                    id: inv.id,
                    bpCode: inv.bpCode,
                    customerName: inv.customerName,
                    riskClass: inv.riskClass,
                    totalOutstanding: Number(inv.balance || 0),
                    invoiceCount: 1,
                    overdueCount: inv.status === 'OVERDUE' ? 1 : 0
                });
            }
        }

        const result = Array.from(customerMap.values())
            .filter((c: TopCustomerGroup) => c.invoiceCount > 0)
            .sort((a: TopCustomerGroup, b: TopCustomerGroup) => b.totalOutstanding - a.totalOutstanding)
            .slice(0, limit);

        res.json(result);
    } catch (error: any) {
        console.error('Error fetching AR top customers:', error);
        res.status(500).json({ error: 'Failed to fetch top customers', message: error.message });
    }
};

// Get monthly comparison (this month vs last month)
export const getMonthlyComparison = async (req: Request, res: Response) => {
    try {
        const today = new Date();

        // Current month
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        // Last month
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

        // Current month invoices created
        const currentMonthInvoices = await prisma.aRInvoice.aggregate({
            where: {
                createdAt: { gte: currentMonthStart, lte: currentMonthEnd }
            },
            _count: true,
            _sum: { totalAmount: true }
        });

        // Last month invoices created
        const lastMonthInvoices = await prisma.aRInvoice.aggregate({
            where: {
                createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
            },
            _count: true,
            _sum: { totalAmount: true }
        });

        // Current month collections
        const currentMonthCollections = await prisma.aRInvoice.aggregate({
            where: {
                status: 'PAID',
                updatedAt: { gte: currentMonthStart, lte: currentMonthEnd }
            },
            _sum: { totalReceipts: true }
        });

        // Last month collections
        const lastMonthCollections = await prisma.aRInvoice.aggregate({
            where: {
                status: 'PAID',
                updatedAt: { gte: lastMonthStart, lte: lastMonthEnd }
            },
            _sum: { totalReceipts: true }
        });

        res.json({
            currentMonth: {
                invoiceCount: currentMonthInvoices._count,
                invoiceValue: currentMonthInvoices._sum?.totalAmount || 0,
                collections: currentMonthCollections._sum?.totalReceipts || 0,
                monthName: currentMonthStart.toLocaleString('default', { month: 'long' })
            },
            lastMonth: {
                invoiceCount: lastMonthInvoices._count,
                invoiceValue: lastMonthInvoices._sum?.totalAmount || 0,
                collections: lastMonthCollections._sum?.totalReceipts || 0,
                monthName: lastMonthStart.toLocaleString('default', { month: 'long' })
            }
        });
    } catch (error: any) {
        console.error('Error fetching AR monthly comparison:', error);
        res.status(500).json({ error: 'Failed to fetch monthly comparison', message: error.message });
    }
};

// Get DSO (Days Sales Outstanding)
export const getDSOMetrics = async (req: Request, res: Response) => {
    try {
        // Get all paid invoices in the last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const paidInvoices = await prisma.aRInvoice.findMany({
            where: {
                status: 'PAID',
                updatedAt: { gte: ninetyDaysAgo }
            },
            select: {
                invoiceDate: true,
                updatedAt: true,
                totalAmount: true
            }
        });

        // Calculate weighted average DSO
        let totalWeightedDays = 0;
        let totalAmount = 0;

        for (const inv of paidInvoices) {
            const daysToCollect = Math.floor(
                (new Date(inv.updatedAt).getTime() - new Date(inv.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            const amount = Number(inv.totalAmount) || 0;
            totalWeightedDays += daysToCollect * amount;
            totalAmount += amount;
        }

        const averageDSO = totalAmount > 0 ? Math.round(totalWeightedDays / totalAmount) : 0;

        // Get current outstanding for DSO target calculation
        const outstanding = await prisma.aRInvoice.aggregate({
            where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
            _sum: { balance: true }
        });

        res.json({
            averageDSO,
            targetDSO: 45,  // Industry standard target
            currentOutstanding: outstanding._sum?.balance || 0,
            invoicesAnalyzed: paidInvoices.length
        });
    } catch (error: any) {
        console.error('Error fetching DSO metrics:', error);
        res.status(500).json({ error: 'Failed to fetch DSO metrics', message: error.message });
    }
};
