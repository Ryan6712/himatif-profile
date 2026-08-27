import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/client.js';
import { env } from '$env/dynamic/private';

const adapter = new PrismaMariaDb({
	host: env.DATABASE_HOST || 'localhost',
	user: env.DATABASE_USER || 'root',
	password: env.DATABASE_PASSWORD || '',
	database: env.DATABASE_NAME || 'himatif_profile',
	port: Number(env.DATABASE_PORT || '3306')
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export { prisma };
