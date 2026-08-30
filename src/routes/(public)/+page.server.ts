import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';

export const load: PageServerLoad = async () => {
	const [organization, memberCount, devisiCount, prokerCount, latestProkers, devisiList] =
		await Promise.all([
			prisma.organization.findUnique({
				where: { id: 1 }
			}),
			prisma.member.count(),
			prisma.devisi.count(),
			prisma.proker.count(),
			prisma.proker.findMany({
				orderBy: { date: 'desc' },
				take: 3,
				select: {
					id: true,
					title: true,
					date: true,
					thumbnailUrl: true,
					description: true,
					slug: true,
					publishedAt: true
				}
			}),
			prisma.devisi.findMany({
				select: {
					id: true,
					nama: true,
					namaLengkap: true,
					logoUrl: true
				}
			})
		]);

	return {
		organization,
		stats: {
			members: memberCount,
			devisi: devisiCount,
			proker: prokerCount
		},
		latestProkers,
		devisiList
	};
};
