const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking offer dates and stages...\n');

    // Check stage distribution
    const stageCount = await prisma.offer.groupBy({
        by: ['stage'],
        _count: { stage: true }
    });
    console.log('Stage distribution:');
    stageCount.forEach(s => console.log(`  ${s.stage}: ${s._count.stage}`));

    // Check year distribution by createdAt
    const offers = await prisma.offer.findMany({
        select: { createdAt: true, offerMonth: true, poReceivedMonth: true, stage: true }
    });

    const yearCounts = {};
    offers.forEach(o => {
        const year = o.createdAt.getFullYear();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    console.log('\nOffers by createdAt year:');
    Object.entries(yearCounts).sort().forEach(([y, c]) => console.log(`  ${y}: ${c}`));

    // Check offerMonth and poReceivedMonth
    const monthYears = new Set();
    offers.forEach(o => {
        if (o.offerMonth) monthYears.add(o.offerMonth.substring(0, 4));
        if (o.poReceivedMonth) monthYears.add(o.poReceivedMonth.substring(0, 4));
    });
    console.log('\nYears in offerMonth/poReceivedMonth:', [...monthYears].sort().join(', '));

    // Check WON/PO_RECEIVED offers with values
    const wonOffers = await prisma.offer.findMany({
        where: { stage: { in: ['WON', 'PO_RECEIVED'] } },
        select: { id: true, stage: true, poValue: true, offerValue: true, poReceivedMonth: true }
    });
    console.log(`\nWON/PO_RECEIVED offers: ${wonOffers.length}`);
    const totalPoValue = wonOffers.reduce((sum, o) => sum + (o.poValue ? Number(o.poValue) : 0), 0);
    const totalOfferValue = wonOffers.reduce((sum, o) => sum + (o.offerValue ? Number(o.offerValue) : 0), 0);
    console.log(`  Total poValue: ${totalPoValue}`);
    console.log(`  Total offerValue: ${totalOfferValue}`);
}

main().finally(() => prisma.$disconnect());
