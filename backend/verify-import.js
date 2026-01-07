/**
 * Verify Imported Offers
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('========================================');
    console.log('VERIFICATION: Imported Data Check');
    console.log('========================================\n');

    // 1. Total Offers
    const totalOffers = await prisma.offer.count();
    console.log(`Total Offers: ${totalOffers}`);

    // 2. Offers by Zone
    console.log('\nOffers by Zone:');
    const zones = await prisma.serviceZone.findMany({
        include: {
            _count: { select: { offers: true } }
        },
        orderBy: { id: 'asc' }
    });
    zones.forEach(z => {
        console.log(`  ${z.name} (ID ${z.id}): ${z._count.offers} offers`);
    });

    // 3. Offers by Stage
    console.log('\nOffers by Stage:');
    const byStage = await prisma.offer.groupBy({
        by: ['stage'],
        _count: { stage: true }
    });
    byStage.forEach(s => {
        console.log(`  ${s.stage}: ${s._count.stage}`);
    });

    // 4. Offers by User (Zone User)
    console.log('\nOffers by Zone User:');
    const users = await prisma.user.findMany({
        where: { role: 'ZONE_USER' },
        include: {
            _count: { select: { assignedOffers: true } }
        },
        orderBy: { id: 'asc' }
    });
    users.forEach(u => {
        console.log(`  ${u.name} (ID ${u.id}): ${u._count.assignedOffers} offers`);
    });

    // 5. Total Customers Created
    const totalCustomers = await prisma.customer.count();
    console.log(`\nTotal Customers: ${totalCustomers}`);

    // 6. Total Contacts Created
    const totalContacts = await prisma.contact.count();
    console.log(`Total Contacts: ${totalContacts}`);

    // 7. Total Assets Created
    const totalAssets = await prisma.asset.count();
    console.log(`Total Assets: ${totalAssets}`);

    // 8. Total OfferAssets (links)
    const totalOfferAssets = await prisma.offerAsset.count();
    console.log(`Total Offer-Asset Links: ${totalOfferAssets}`);

    // 9. Sample offers
    console.log('\n========================================');
    console.log('Sample Offers (first 5)');
    console.log('========================================');
    const sampleOffers = await prisma.offer.findMany({
        take: 5,
        include: {
            zone: true,
            assignedTo: true
        },
        orderBy: { id: 'asc' }
    });
    sampleOffers.forEach(o => {
        console.log(`\n  ID: ${o.id}`);
        console.log(`  Ref: ${o.offerReferenceNumber}`);
        console.log(`  Company: ${o.company}`);
        console.log(`  Zone: ${o.zone.name}`);
        console.log(`  Assigned To: ${o.assignedTo?.name || 'N/A'}`);
        console.log(`  Stage: ${o.stage}`);
        console.log(`  PO: ${o.poNumber || 'N/A'}`);
    });

    console.log('\n========================================');
    console.log('Verification Complete ✓');
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
