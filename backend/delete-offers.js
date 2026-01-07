/**
 * Remove all imported offers (ID > 3)
 * Keeps the 3 original offers (ID 1, 2, 3)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('========================================');
    console.log('Removing Imported Offers');
    console.log('========================================\n');

    // First delete OfferAssets (foreign key constraint)
    console.log('Step 1: Deleting OfferAsset links...');
    const deletedAssets = await prisma.offerAsset.deleteMany({
        where: { offerId: { gt: 3 } }
    });
    console.log(`  ✓ Deleted ${deletedAssets.count} OfferAsset links\n`);

    // Delete StageRemarks
    console.log('Step 2: Deleting StageRemarks...');
    const deletedRemarks = await prisma.stageRemark.deleteMany({
        where: { offerId: { gt: 3 } }
    });
    console.log(`  ✓ Deleted ${deletedRemarks.count} StageRemarks\n`);

    // Delete offers
    console.log('Step 3: Deleting offers (ID > 3)...');
    const deletedOffers = await prisma.offer.deleteMany({
        where: { id: { gt: 3 } }
    });
    console.log(`  ✓ Deleted ${deletedOffers.count} offers\n`);

    // Verify
    const remainingOffers = await prisma.offer.count();
    console.log(`Remaining offers: ${remainingOffers}`);

    console.log('\n✓ Cleanup complete!');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
