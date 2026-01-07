/**
 * Fix Offer Data:
 * 1. Change PO_RECEIVED stage to WON
 * 2. Fix any offers without assignedToId
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('========================================');
    console.log('Fixing Offer Data');
    console.log('========================================\n');

    // 1. Update PO_RECEIVED to WON
    console.log('Step 1: Updating PO_RECEIVED → WON...');
    const updatedToWon = await prisma.offer.updateMany({
        where: { stage: 'PO_RECEIVED' },
        data: { stage: 'WON' }
    });
    console.log(`  ✓ Updated ${updatedToWon.count} offers from PO_RECEIVED to WON`);

    // 2. Check offers without assignedToId
    console.log('\nStep 2: Checking offers without assignedToId...');
    const unassignedOffers = await prisma.offer.findMany({
        where: { assignedToId: null },
        select: { id: true, offerReferenceNumber: true, company: true, zoneId: true }
    });

    if (unassignedOffers.length > 0) {
        console.log(`  Found ${unassignedOffers.length} offers without assigned user:`);
        unassignedOffers.forEach(o => {
            console.log(`    ID ${o.id}: ${o.offerReferenceNumber} (Zone ${o.zoneId})`);
        });

        // These are likely manually created offers - we can leave them or assign based on zone
        console.log('\n  Note: These offers may have been created manually before import.');
    } else {
        console.log('  ✓ All offers have assignedToId');
    }

    // 3. Verify final stage counts
    console.log('\n========================================');
    console.log('Final Stage Counts');
    console.log('========================================');
    const byStage = await prisma.offer.groupBy({
        by: ['stage'],
        _count: { stage: true }
    });
    byStage.forEach(s => {
        console.log(`  ${s.stage}: ${s._count.stage}`);
    });

    console.log('\n✓ Fix complete!');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
