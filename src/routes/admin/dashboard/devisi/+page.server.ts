import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const divisiList = await prisma.devisi.findMany({
		include: {
			_count: { select: { member: true } }
		},
		orderBy: { nama: 'asc' }
	});
	return { divisiList };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (!id || isNaN(id)) {
			return fail(400, { error: 'ID tidak valid' });
		}

		const divisi = await prisma.devisi.findUnique({ where: { id } });
		if (!divisi) {
			return fail(404, { error: 'Divisi tidak ditemukan' });
		}

		try {
			await prisma.devisi.delete({ where: { id } });
			return { success: true, message: `Divisi "${divisi.nama}" berhasil dihapus` };
		} catch (error) {
			return fail(500, { error: 'Terjadi kesalahan saat menghapus data.' });
		}
	}
};
