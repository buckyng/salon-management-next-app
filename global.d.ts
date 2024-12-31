import { PrismaClient } from '@prisma/client';

declare global {
  // Augment the global scope with a `prisma` property
  var prisma: PrismaClient | undefined;
}
