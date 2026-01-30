/**
 * Script to cleanup orphaned payment records
 * Run this ONCE to remove payments that reference deleted invoices
 */
import prisma from './src/config/db';
import { Decimal } from '@prisma/client/runtime/library';

interface PaymentRecord {
    id: string;
    invoiceId: string;
    amount: Decimal;
}

interface InvoiceRecord {
    id: string;
}

async function cleanupOrphanedPayments() {
    console.log('Starting orphaned payments cleanup...');

    // Get all unique invoice IDs from payment history
    const payments: PaymentRecord[] = await prisma.aRPaymentHistory.findMany({
        select: { id: true, invoiceId: true, amount: true }
    });
    console.log(`Found ${payments.length} total payment records`);

    // Get all existing invoice IDs
    const existingInvoices: InvoiceRecord[] = await prisma.aRInvoice.findMany({
        select: { id: true }
    });
    const existingInvoiceIds = new Set(existingInvoices.map((inv: InvoiceRecord) => inv.id));
    console.log(`Found ${existingInvoices.length} existing invoices`);

    // Find orphaned payments (those referencing non-existent invoices)
    const orphanedPayments = payments.filter((p: PaymentRecord) => !existingInvoiceIds.has(p.invoiceId));
    console.log(`Found ${orphanedPayments.length} orphaned payment records`);

    if (orphanedPayments.length === 0) {
        console.log('No orphaned payments to clean up!');
        await prisma.$disconnect();
        return;
    }

    // Show what will be deleted
    const totalOrphanedAmount = orphanedPayments.reduce((sum: number, p: PaymentRecord) => sum + Number(p.amount), 0);
    console.log(`Total orphaned amount: ₹${totalOrphanedAmount.toLocaleString()}`);

    // Delete orphaned payments
    const orphanedPaymentIds = orphanedPayments.map((p: PaymentRecord) => p.id);
    const deleteResult = await prisma.aRPaymentHistory.deleteMany({
        where: { id: { in: orphanedPaymentIds } }
    });

    console.log(`Successfully deleted ${deleteResult.count} orphaned payment records`);
    await prisma.$disconnect();
}

cleanupOrphanedPayments().catch(console.error);

