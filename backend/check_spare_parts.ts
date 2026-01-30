
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const spareParts = await prisma.sparePart.findMany({
        where: { imageUrl: { not: null } },
        take: 5,
        select: { id: true, partNumber: true, imageUrl: true }
    });
    console.log(JSON.stringify(spareParts, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
