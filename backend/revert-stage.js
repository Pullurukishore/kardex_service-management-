/**
 * Revert WON back to PO_RECEIVED
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('========================================');
    console.log('Reverting WON → PO_RECEIVED');
    console.log('========================================\n');

    // Revert WON to PO_RECEIVED (except the 2 that were originally WON - IDs 1, 2)
    const reverted = await prisma.offer.updateMany({
        where: {
            stage: 'WON',
            id: { gt: 3 }  // Only offers imported from Excel (ID > 3)
        },
        data: { stage: 'PO_RECEIVED' }
    });
    console.log(`  ✓ Reverted ${reverted.count} offers from WON to PO_RECEIVED`);

    // Verify final stage counts
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

    console.log('\n✓ Revert complete!');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
