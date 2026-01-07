/**
 * Script to create 10 Zone Users based on the Excel offer data
 * Uses EXISTING zones (IDs 1-4)
 * 
 * Users:
 * West Zone (ID: 1): Yogesh, Ashraf, Rahul, Minesh
 * North Zone (ID: 2): Vinay, Nitin
 * South Zone (ID: 3): Gajendra, Pradeep, Sasi
 * East Zone (ID: 4): Pankaj
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Existing zone IDs
const existingZones = {
    'WEST': 1,   // "West"
    'NORTH': 2,  // "North" 
    'SOUTH': 3,  // "South"
    'EAST': 4    // "East"
};

// Zone Users data
const zoneUsers = [
    // WEST Zone (ID: 1)
    { name: 'Yogesh', shortForm: 'YD', zone: 'WEST', email: 'yogesh@kardex.com' },
    { name: 'Ashraf', shortForm: 'AB', zone: 'WEST', email: 'ashraf@kardex.com' },
    { name: 'Rahul', shortForm: 'RV', zone: 'WEST', email: 'rahul@kardex.com' },
    { name: 'Minesh', shortForm: 'MV', zone: 'WEST', email: 'minesh@kardex.com' },

    // SOUTH Zone (ID: 3)
    { name: 'Gajendra', shortForm: 'GA', zone: 'SOUTH', email: 'gajendra@kardex.com' },
    { name: 'Pradeep', shortForm: 'PK', zone: 'SOUTH', email: 'pradeep@kardex.com' },
    { name: 'Sasi', shortForm: 'SK', zone: 'SOUTH', email: 'sasi@kardex.com' },

    // NORTH Zone (ID: 2)
    { name: 'Vinay', shortForm: 'VJ', zone: 'NORTH', email: 'vinay@kardex.com' },
    { name: 'Nitin', shortForm: 'NJ', zone: 'NORTH', email: 'nitin@kardex.com' },

    // EAST Zone (ID: 4)
    { name: 'Pankaj', shortForm: 'PKS', zone: 'EAST', email: 'pankaj@kardex.com' }
];

async function main() {
    console.log('========================================');
    console.log('Creating Zone Users (Using Existing Zones)');
    console.log('========================================\n');

    // Default password for all users (should be changed on first login)
    const defaultPassword = await bcrypt.hash('Kardex@123', 10);

    // Verify existing zones
    console.log('Verifying existing zones...');
    for (const [zoneName, zoneId] of Object.entries(existingZones)) {
        const zone = await prisma.serviceZone.findUnique({ where: { id: zoneId } });
        if (zone) {
            console.log(`  ✓ Zone ${zoneId}: "${zone.name}"`);
        } else {
            console.error(`  ✗ Zone ${zoneId} not found!`);
            process.exit(1);
        }
    }

    console.log('\nCreating Zone Users...\n');

    const createdUsers = [];

    for (const userData of zoneUsers) {
        const zoneId = existingZones[userData.zone];

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: userData.email,
                    password: defaultPassword,
                    name: userData.name,
                    shortForm: userData.shortForm,
                    role: 'ZONE_USER',
                    zoneId: String(zoneId),
                    isActive: true,
                    tokenVersion: uuidv4()
                }
            });

            // Link user to zone via ServicePersonZone
            await prisma.servicePersonZone.upsert({
                where: {
                    userId_serviceZoneId: {
                        userId: user.id,
                        serviceZoneId: zoneId
                    }
                },
                update: {},
                create: {
                    userId: user.id,
                    serviceZoneId: zoneId
                }
            });

            console.log(`  ✓ Created: ${userData.name} → Zone ${zoneId} (${userData.zone}) - ID: ${user.id}`);
        } else {
            console.log(`  • Exists: ${userData.name} (${userData.email}) - ID: ${user.id}`);
        }

        createdUsers.push({
            ...userData,
            id: user.id,
            zoneId: zoneId
        });
    }

    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================');
    console.log('\nUsers by Zone:');
    for (const [zoneName, zoneId] of Object.entries(existingZones)) {
        const usersInZone = createdUsers.filter(u => u.zone === zoneName);
        if (usersInZone.length > 0) {
            console.log(`  ${zoneName} (Zone ${zoneId}): ${usersInZone.map(u => u.name).join(', ')}`);
        }
    }

    console.log('\nDefault password: Kardex@123');
    console.log('========================================\n');

    // Export user mapping for use in offer import
    const fs = require('fs');
    const path = require('path');

    const userMapping = {};
    createdUsers.forEach(u => {
        userMapping[u.name] = {
            userId: u.id,
            zoneId: u.zoneId,
            zone: u.zone
        };
    });

    fs.writeFileSync(
        path.join(__dirname, 'data', 'user-mapping.json'),
        JSON.stringify(userMapping, null, 2)
    );
    console.log('✓ User mapping exported to data/user-mapping.json');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
