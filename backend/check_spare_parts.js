
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const spareParts = await prisma.sparePart.findMany({
        where: { imageUrl: { not: null } },
        take: 10,
        select: { id: true, partNumber: true, imageUrl: true }
    });
    fs.writeFileSync('spare_parts_check.json', JSON.stringify(spareParts, null, 2));
}

main()
    .catch(e => fs.writeFileSync('spare_parts_check_error.txt', e.toString()))
    .finally(async () => await prisma.$disconnect());
