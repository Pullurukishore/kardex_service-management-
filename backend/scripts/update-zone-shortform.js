// Script to update zone shortForm values
// Run with: node scripts/update-zone-shortform.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateZoneShortForms() {
    console.log('Starting zone shortForm update...\n');

    try {
        // Get all zones
        const zones = await prisma.serviceZone.findMany({
            select: { id: true, name: true, shortForm: true }
        });

        console.log('Current zones:');
        zones.forEach(zone => {
            console.log(`  - ID: ${zone.id}, Name: ${zone.name}, ShortForm: ${zone.shortForm || 'NOT SET'}`);
        });
        console.log('');

        // Define shortForm mappings based on zone names
        // You can customize these based on your actual zone names
        const shortFormMappings = {
            'South': 'S',
            'North': 'N',
            'East': 'E',
            'West': 'W',
            'Central': 'C',
            'South Zone': 'S',
            'North Zone': 'N',
            'East Zone': 'E',
            'West Zone': 'W',
            'Central Zone': 'C',
        };

        // Update ALL zones to have correct shortForm based on their name
        for (const zone of zones) {
            // Try to find a mapping for this zone
            let newShortForm = shortFormMappings[zone.name];

            // If no mapping found, use first letter of zone name
            if (!newShortForm && zone.name) {
                newShortForm = zone.name.charAt(0).toUpperCase();
            }

            if (newShortForm && zone.shortForm !== newShortForm) {
                console.log(`Updating zone "${zone.name}" (ID: ${zone.id}) - Changing shortForm from "${zone.shortForm || 'null'}" to "${newShortForm}"`);

                await prisma.serviceZone.update({
                    where: { id: zone.id },
                    data: { shortForm: newShortForm }
                });
            } else if (zone.shortForm === newShortForm) {
                console.log(`Zone "${zone.name}" already has correct shortForm: "${zone.shortForm}" - Skipping`);
            }
        }

        console.log('\n✅ Zone shortForm update completed!');

        // Show updated zones
        const updatedZones = await prisma.serviceZone.findMany({
            select: { id: true, name: true, shortForm: true }
        });

        console.log('\nUpdated zones:');
        updatedZones.forEach(zone => {
            console.log(`  - ID: ${zone.id}, Name: ${zone.name}, ShortForm: ${zone.shortForm || 'NOT SET'}`);
        });

    } catch (error) {
        console.error('Error updating zone shortForms:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

updateZoneShortForms()
    .then(() => {
        console.log('\nScript completed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nScript failed:', error);
        process.exit(1);
    });
