import { Request, Response } from 'express';
import prisma from '../../config/db';

// Get all customers with pagination
export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const { search, riskClass, page = 1, limit = 50 } = req.query;

        const where: any = {};

        if (search) {
            where.OR = [
                { bpCode: { contains: String(search), mode: 'insensitive' } },
                { customerName: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        if (riskClass) {
            where.riskClass = riskClass;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [customers, total] = await Promise.all([
            prisma.aRCustomer.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { customerName: 'asc' },
                include: {
                    _count: { select: { invoices: true } }
                }
            }),
            prisma.aRCustomer.count({ where })
        ]);

        res.json({
            data: customers,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Error fetching AR customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers', message: error.message });
    }
};

// Get customer by ID
export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const customer = await prisma.aRCustomer.findUnique({
            where: { id },
            include: {
                invoices: {
                    orderBy: { invoiceDate: 'desc' },
                    take: 10,
                    include: {
                        paymentTerms: true
                    }
                }
            }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(customer);
    } catch (error: any) {
        console.error('Error fetching AR customer:', error);
        res.status(500).json({ error: 'Failed to fetch customer', message: error.message });
    }
};

// Create customer
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const {
            bpCode,
            customerName,
            region,
            department,
            personInCharge,
            contactNo,
            emailId,
            riskClass,
            creditLimit
        } = req.body;

        if (!bpCode || !customerName) {
            return res.status(400).json({ error: 'BP Code and Customer Name are required' });
        }

        const customer = await prisma.aRCustomer.create({
            data: {
                bpCode,
                customerName,
                region,
                department,
                personInCharge,
                contactNo,
                emailId,
                riskClass: riskClass || 'LOW',
                creditLimit: creditLimit ? parseFloat(creditLimit) : null
            }
        });

        res.status(201).json(customer);
    } catch (error: any) {
        console.error('Error creating AR customer:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Customer with this BP Code already exists' });
        }
        res.status(500).json({ error: 'Failed to create customer', message: error.message });
    }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.creditLimit) {
            updateData.creditLimit = parseFloat(updateData.creditLimit);
        }

        const customer = await prisma.aRCustomer.update({
            where: { id },
            data: updateData
        });

        res.json(customer);
    } catch (error: any) {
        console.error('Error updating AR customer:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(500).json({ error: 'Failed to update customer', message: error.message });
    }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if customer has invoices
        const invoiceCount = await prisma.aRInvoice.count({ where: { customerId: id } });
        if (invoiceCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete customer with existing invoices',
                invoiceCount
            });
        }

        await prisma.aRCustomer.delete({
            where: { id }
        });

        res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting AR customer:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(500).json({ error: 'Failed to delete customer', message: error.message });
    }
};
