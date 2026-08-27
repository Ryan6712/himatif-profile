import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const devisiList = await prisma.devisi.findMany({
		orderBy: { id: 'asc' }
	});

	return {
		devisiList
	};
};
