/**
 * Remove all Spare Parts from the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('========================================');
    console.log('Removing All Spare Parts');
    console.log('========================================\n');

    // Count before deletion
    const countBefore = await prisma.sparePart.count();
    console.log(`Current spare part count: ${countBefore}`);

    if (countBefore === 0) {
        console.log('No spare parts found to delete.');
        return;
    }

    // Delete SpareParts
    // Note: OfferSparePart has onDelete: Cascade in the schema, 
    // but Prisma's behavior depends on whether it's supported by the DB or handled by Prisma.
    // In our schema, it's defined:
    // offerSpareParts OfferSparePart[]  @relation("SparePartToOffers")
    // and in OfferSparePart:
    // sparePart   SparePart @relation("SparePartToOffers", fields: [sparePartId], references: [id], onDelete: Cascade)

    console.log('Step 1: Deleting all spare parts...');
    const deletedParts = await prisma.sparePart.deleteMany({});
    console.log(`  ✓ Deleted ${deletedParts.count} spare parts\n`);

    // Verify
    const remainingParts = await prisma.sparePart.count();
    console.log(`Remaining spare parts: ${remainingParts}`);

    console.log('\n✓ Deletion complete!');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
