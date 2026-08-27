import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './db.ts';
import { username } from 'better-auth/plugins';
import { env } from '$env/dynamic/private';

const trustedOrigins = [
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:3000',
	'http://127.0.0.1:3000'
];

if (env.BETTER_AUTH_URL && !trustedOrigins.includes(env.BETTER_AUTH_URL)) {
	trustedOrigins.push(env.BETTER_AUTH_URL);
}

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'mysql'
	}),
	emailAndPassword: {
		enabled: true
	},
	plugins: [username()],
	trustedOrigins
});
