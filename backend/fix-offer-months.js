/**
 * Fix Offer Months Script
 * 
 * Updates offerMonth, poExpectedMonth, poReceivedMonth to use the correct year
 * based on the offer's registrationDate instead of hardcoded 2025.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('========================================');
    console.log('Fixing Offer Month Years');
    console.log('========================================\n');

    // Get all offers that have month fields set
    const offers = await prisma.offer.findMany({
        where: {
            OR: [
                { offerMonth: { not: null } },
                { poExpectedMonth: { not: null } },
                { poReceivedMonth: { not: null } }
            ]
        },
        select: {
            id: true,
            offerReferenceNumber: true,
            registrationDate: true,
            offerMonth: true,
            poExpectedMonth: true,
            poReceivedMonth: true
        }
    });

    console.log(`Found ${offers.length} offers with month fields to check.\n`);

    let updated = 0;
    let skipped = 0;

    for (const offer of offers) {
        if (!offer.registrationDate) {
            skipped++;
            continue;
        }

        const correctYear = offer.registrationDate.getFullYear();

        // Check if any month field needs updating
        let needsUpdate = false;
        const updates = {};

        // Fix offerMonth
        if (offer.offerMonth && !offer.offerMonth.startsWith(String(correctYear))) {
            const monthNum = offer.offerMonth.split('-')[1];
            updates.offerMonth = `${correctYear}-${monthNum}`;
            needsUpdate = true;
        }

        // Fix poExpectedMonth
        if (offer.poExpectedMonth && !offer.poExpectedMonth.startsWith(String(correctYear))) {
            const monthNum = offer.poExpectedMonth.split('-')[1];
            updates.poExpectedMonth = `${correctYear}-${monthNum}`;
            needsUpdate = true;
        }

        // Fix poReceivedMonth
        if (offer.poReceivedMonth && !offer.poReceivedMonth.startsWith(String(correctYear))) {
            const monthNum = offer.poReceivedMonth.split('-')[1];
            updates.poReceivedMonth = `${correctYear}-${monthNum}`;
            needsUpdate = true;
        }

        if (needsUpdate) {
            await prisma.offer.update({
                where: { id: offer.id },
                data: updates
            });
            console.log(`✓ Fixed ${offer.offerReferenceNumber}: ${JSON.stringify(updates)}`);
            updated++;
        } else {
            skipped++;
        }
    }

    console.log('\n========================================');
    console.log('FIX SUMMARY');
    console.log('========================================');
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped (already correct): ${skipped}`);
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
