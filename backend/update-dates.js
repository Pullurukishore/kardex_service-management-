/**
 * Update offers createdAt from 2026 to 2025
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('========================================');
    console.log('Updating createdAt from 2026 to 2025');
    console.log('========================================\n');

    // Update all offers with createdAt in 2026 to 2025
    // We'll subtract 1 year from the date
    const offers2026 = await prisma.offer.findMany({
        where: {
            createdAt: {
                gte: new Date('2026-01-01'),
                lt: new Date('2027-01-01')
            }
        },
        select: { id: true, createdAt: true }
    });

    console.log(`Found ${offers2026.length} offers with createdAt in 2026`);

    let updated = 0;
    for (const offer of offers2026) {
        const newDate = new Date(offer.createdAt);
        newDate.setFullYear(2025);

        await prisma.offer.update({
            where: { id: offer.id },
            data: { createdAt: newDate }
        });
        updated++;
    }

    console.log(`✓ Updated ${updated} offers to 2025\n`);

    // Verify
    const yearCounts = await prisma.offer.groupBy({
        by: [],
        _count: true,
        where: {
            createdAt: {
                gte: new Date('2025-01-01'),
                lt: new Date('2026-01-01')
            }
        }
    });

    console.log('Verification - Offers by year:');
    const offers2025 = await prisma.offer.count({
        where: {
            createdAt: {
                gte: new Date('2025-01-01'),
                lt: new Date('2026-01-01')
            }
        }
    });
    console.log(`  2025: ${offers2025}`);

    const remaining2026 = await prisma.offer.count({
        where: {
            createdAt: {
                gte: new Date('2026-01-01'),
                lt: new Date('2027-01-01')
            }
        }
    });
    console.log(`  2026: ${remaining2026}`);

    console.log('\n✓ Done!');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
