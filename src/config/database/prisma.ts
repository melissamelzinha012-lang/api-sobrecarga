import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Encerra corretamente a conexão quando a aplicação for finalizada.
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
