/**
 * Cleanup duplicate zones and link users to existing zones
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Correct zone mapping (existing zones)
const correctZoneMapping = {
    'WEST': 1,   // "West" zone
    'NORTH': 2,  // "North" zone
    'SOUTH': 3,  // "South" zone
    'EAST': 4    // "East" zone
};

// User to zone mapping
const userZones = {
    6: 'WEST',   // Yogesh
    7: 'WEST',   // Ashraf
    8: 'WEST',   // Rahul
    9: 'WEST',   // Minesh
    10: 'SOUTH', // Gajendra
    11: 'SOUTH', // Pradeep
    12: 'SOUTH', // Sasi
    13: 'NORTH', // Vinay
    14: 'NORTH', // Nitin
    15: 'EAST'   // Pankaj
};

async function main() {
    console.log('========================================');
    console.log('Cleaning Up Duplicate Zones');
    console.log('========================================\n');

    // Step 1: Delete ServicePersonZone entries for duplicate zones (5-8)
    console.log('Step 1: Deleting ServicePersonZone entries for duplicate zones...');
    await prisma.servicePersonZone.deleteMany({
        where: {
            serviceZoneId: { in: [5, 6, 7, 8] }
        }
    });
    console.log('  ✓ Deleted\n');

    // Step 2: Update users to use correct zones
    console.log('Step 2: Updating users to correct zones...');
    for (const [userId, zoneName] of Object.entries(userZones)) {
        const correctZoneId = correctZoneMapping[zoneName];
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { zoneId: String(correctZoneId) }
        });
        console.log(`  ✓ User ${userId} → Zone ${correctZoneId} (${zoneName})`);
    }
    console.log('');

    // Step 3: Create ServicePersonZone entries for correct zones
    console.log('Step 3: Creating ServicePersonZone entries for correct zones...');
    for (const [userId, zoneName] of Object.entries(userZones)) {
        const correctZoneId = correctZoneMapping[zoneName];

        // Check if already exists
        const existing = await prisma.servicePersonZone.findUnique({
            where: {
                userId_serviceZoneId: {
                    userId: parseInt(userId),
                    serviceZoneId: correctZoneId
                }
            }
        });

        if (!existing) {
            await prisma.servicePersonZone.create({
                data: {
                    userId: parseInt(userId),
                    serviceZoneId: correctZoneId
                }
            });
            console.log(`  ✓ User ${userId} linked to Zone ${correctZoneId}`);
        } else {
            console.log(`  • User ${userId} already linked to Zone ${correctZoneId}`);
        }
    }
    console.log('');

    // Step 4: Delete duplicate zones (5-8)
    console.log('Step 4: Deleting duplicate zones (5-8)...');
    await prisma.serviceZone.deleteMany({
        where: {
            id: { in: [5, 6, 7, 8] }
        }
    });
    console.log('  ✓ Deleted duplicate zones\n');

    console.log('========================================');
    console.log('Cleanup Complete');
    console.log('========================================\n');

    // Verify
    console.log('Remaining zones:');
    const zones = await prisma.serviceZone.findMany({ orderBy: { id: 'asc' } });
    zones.forEach(z => console.log(`  ID: ${z.id}, Name: "${z.name}"`));

    console.log('\nUser zone assignments:');
    const users = await prisma.user.findMany({
        where: { id: { in: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15] } },
        orderBy: { id: 'asc' }
    });
    users.forEach(u => console.log(`  ${u.name}: Zone ${u.zoneId}`));

    // Update user mapping file
    const fs = require('fs');
    const path = require('path');

    const userMapping = {};
    users.forEach(u => {
        const zoneName = Object.entries(userZones).find(([id]) => parseInt(id) === u.id)?.[1];
        userMapping[u.name] = {
            userId: u.id,
            zoneId: correctZoneMapping[zoneName],
            zone: zoneName
        };
    });

    fs.writeFileSync(
        path.join(__dirname, 'data', 'user-mapping.json'),
        JSON.stringify(userMapping, null, 2)
    );
    console.log('\n✓ Updated user-mapping.json with correct zone IDs');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
