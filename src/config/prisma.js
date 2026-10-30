// Singleton para o Prisma - Ponto único de configuração
// Melhora a performace para não abrir várias pools de queries

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
