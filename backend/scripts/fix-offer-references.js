// Script to fix existing offer reference numbers with incorrect zone abbreviations
// Run with: node scripts/fix-offer-references.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOfferReferences() {
    console.log('Starting offer reference fix...\n');

    try {
        // Get all zones with their correct abbreviations
        const zones = await prisma.serviceZone.findMany({
            select: { id: true, name: true, shortForm: true }
        });

        console.log('Zones:');
        zones.forEach(zone => {
            const correctAbbr = zone.shortForm || zone.name.charAt(0).toUpperCase();
            console.log(`  - ID: ${zone.id}, Name: ${zone.name}, Abbreviation: ${correctAbbr}`);
        });
        console.log('');

        // Find offers with 'X' in the zone position (format: KRIND/X/...)
        const offersWithX = await prisma.offer.findMany({
            where: {
                offerReferenceNumber: {
                    contains: '/X/'
                }
            },
            include: {
                zone: {
                    select: { id: true, name: true, shortForm: true }
                }
            }
        });

        console.log(`Found ${offersWithX.length} offer(s) with '/X/' in reference number:\n`);

        for (const offer of offersWithX) {
            const correctAbbr = offer.zone?.shortForm || (offer.zone?.name ? offer.zone.name.charAt(0).toUpperCase() : 'X');
            const oldRef = offer.offerReferenceNumber;
            const newRef = oldRef.replace('/X/', `/${correctAbbr}/`);

            console.log(`Offer ID: ${offer.id}`);
            console.log(`  Zone: ${offer.zone?.name || 'Unknown'}`);
            console.log(`  Old Reference: ${oldRef}`);
            console.log(`  New Reference: ${newRef}`);

            if (oldRef !== newRef) {
                await prisma.offer.update({
                    where: { id: offer.id },
                    data: { offerReferenceNumber: newRef }
                });
                console.log(`  ✅ Updated successfully!`);
            } else {
                console.log(`  ⏭️ No change needed`);
            }
            console.log('');
        }

        console.log('\n✅ Offer reference fix completed!');

    } catch (error) {
        console.error('Error fixing offer references:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

fixOfferReferences()
    .then(() => {
        console.log('\nScript completed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nScript failed:', error);
        process.exit(1);
    });
