import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';

export const load: PageServerLoad = async () => {
	const organization = await prisma.organization.findUnique({
		where: { id: 1 }
	});

	return {
		organization
	};
};
