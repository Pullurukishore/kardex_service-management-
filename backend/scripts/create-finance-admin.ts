/**
 * Create or Update Finance Admin User
 * 
 * NOTE: The 'role' field is the FSM role (now optional).
 * For Finance-only users, we DON'T set any FSM role.
 * Access is determined by 'financeRole' field.
 * 
 * Logic:
 * - If user has financeRole → Finance module only
 * - If user has role (FSM role) → FSM module only
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createFinanceAdmin() {
    const email = 'finance@kardex.com';
    const password = 'Finance@123';

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // Update existing user to have financeRole and remove FSM role
            const updated = await prisma.user.update({
                where: { email },
                data: {
                    financeRole: 'FINANCE_ADMIN',
                    role: null as any // Remove FSM role (role is now nullable in schema)
                },
            });
            console.log('');
            console.log('✅ Updated existing user to FINANCE_ADMIN');
            console.log('   Email:', email);
            console.log('   Finance Role: FINANCE_ADMIN');
            console.log('   FSM Role: None (Finance-only user)');
            console.log('   User ID:', updated.id);
            console.log('');
            console.log('   This user will now ONLY see the Finance module.');
        } else {
            // Create new user (no FSM role for finance-only users)
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Finance Admin',
                    // role is NOT set - finance-only user has no FSM role
                    financeRole: 'FINANCE_ADMIN', // This determines Finance access
                    isActive: true,
                    tokenVersion: crypto.randomUUID(),
                },
            });

            console.log('');
            console.log('✅ Finance Admin created successfully!');
            console.log('   Email:', email);
            console.log('   Password:', password);
            console.log('   Finance Role: FINANCE_ADMIN');
            console.log('   FSM Role: None (Finance-only user)');
            console.log('   User ID:', user.id);
            console.log('');
            console.log('   This user will ONLY see the Finance module.');
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createFinanceAdmin();
