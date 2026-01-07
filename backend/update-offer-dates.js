/**
 * Update offer dates from 2026 to 2025
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating offer dates from 2026 to 2025...\n');

    // Get all offers with 2026 dates
    const offers = await prisma.offer.findMany({
        where: {
            createdAt: {
                gte: new Date('2026-01-01'),
                lt: new Date('2027-01-01')
            }
        },
        select: {
            id: true,
            registrationDate: true,
            createdAt: true
        }
    });

    console.log(`Found ${offers.length} offers with 2026 dates\n`);

    let updated = 0;
    for (const offer of offers) {
        // Use registration date if available, otherwise set to Jan 1, 2025
        const newDate = offer.registrationDate || new Date('2025-01-01');

        await prisma.offer.update({
            where: { id: offer.id },
            data: {
                createdAt: newDate,
                updatedAt: newDate
            }
        });
        updated++;
    }

    console.log(`✓ Updated ${updated} offers to 2025 dates`);
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
