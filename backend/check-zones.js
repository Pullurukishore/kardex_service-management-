/**
 * Script to check existing zones and clean up duplicates
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('========================================');
    console.log('Checking Existing Zones');
    console.log('========================================\n');

    // Get all zones
    const allZones = await prisma.serviceZone.findMany({
        orderBy: { id: 'asc' }
    });

    console.log('All Service Zones:');
    allZones.forEach(zone => {
        console.log(`  ID: ${zone.id}, Name: "${zone.name}", ShortForm: "${zone.shortForm}"`);
    });

    console.log('\n========================================');
    console.log('Checking Users Created');
    console.log('========================================\n');

    // Get users with IDs 6-15 (newly created)
    const newUsers = await prisma.user.findMany({
        where: {
            id: { in: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }
        }
    });

    console.log('Users to be cleaned up:');
    newUsers.forEach(user => {
        console.log(`  ID: ${user.id}, Name: "${user.name}", Email: "${user.email}"`);
    });

    console.log('\n========================================');
    console.log('Run cleanup-zones.js to delete duplicates');
    console.log('========================================');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
