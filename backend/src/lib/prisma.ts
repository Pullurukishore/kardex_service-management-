import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client
const prisma = global.prisma || new PrismaClient();

// Cache in both development and production to prevent connection leaks
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
