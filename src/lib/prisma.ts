import { PrismaClient } from '@prisma/client';

// Singleton pattern for PrismaClient to prevent multiple instances in development
// This is safe for hot-reload and prevents connection pool exhaustion
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaClient = (): PrismaClient => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Store in global scope to prevent hot-reload from creating new instances
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
};

export const prisma = getPrismaClient();

