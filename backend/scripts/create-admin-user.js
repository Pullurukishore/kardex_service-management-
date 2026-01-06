const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log('[INFO] Creating admin user...');

        // Check if admin already exists
        const existingAdmin = await prisma.user.findFirst({
            where: {
                role: 'ADMIN'
            }
        });

        if (existingAdmin) {
            console.log(`[INFO] Admin user already exists with ID: ${existingAdmin.id}`);
            console.log(`[INFO] Email: ${existingAdmin.email}`);
            return existingAdmin;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email: 'admin@kardexcare.com',
                password: hashedPassword,
                role: 'ADMIN',
                name: 'System Admin',
                isActive: true,
                tokenVersion: uuidv4()
            }
        });

        console.log('[SUCCESS] ✓ Admin user created successfully!');
        console.log(`[INFO] ID: ${admin.id}`);
        console.log(`[INFO] Email: admin@kardexcare.com`);
        console.log(`[INFO] Password: Admin@123`);
        console.log('[WARN] ⚠ Please change the password after first login!');

        return admin;

    } catch (error) {
        console.error(`[ERROR] ✗ Failed to create admin: ${error.message}`);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
