import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const members = await prisma.member.findMany({
		include: {
			devisi: {
				select: {
					nama: true
				}
			}
		},
		orderBy: {
			name: 'asc'
		}
	});

	// Group by memberType
	const bph = members.filter((m) => m.memberType === 'BPH');
	const kadiv = members.filter((m) => m.memberType === 'KADIV');
	const regular = members.filter((m) => m.memberType === 'REGULAR');
	const alumni = members.filter((m) => m.memberType === 'ALUMNI');

	return {
		bph,
		kadiv,
		member: regular,
		alumni
	};
};
