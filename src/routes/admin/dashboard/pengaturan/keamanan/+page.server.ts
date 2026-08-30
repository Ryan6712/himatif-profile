import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Akses ditolak');
	}

	// Mengambil profile user untuk mengetahui informasi email utama & backup-nya saat ini
	const user = await prisma.user.findUnique({
		where: { id: locals.user.id },
		select: {
			email: true,
			backupEmail: true
		}
	});

	if (!user) {
		throw error(404, 'User tidak ditemukan');
	}

	return {
		profile: user
	};
};
