const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function safeMigrate() {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count().catch(() => null);
    
    if (userCount === null) {
      // Database is empty or tables don't exist, safe to migrate
      process.exit(0);
    } else {
      // Check if this is a fresh deployment or update
      if (process.env.FORCE_MIGRATE === 'true') {
        process.exit(0);
      } else {
        process.exit(1);
      }
    }
  } catch (error) {
    // If it's a connection error to empty database, it's probably safe to migrate
    if (error.code === 'P1001' || error.message.includes('database') || error.message.includes('relation')) {
      process.exit(0);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

safeMigrate();
