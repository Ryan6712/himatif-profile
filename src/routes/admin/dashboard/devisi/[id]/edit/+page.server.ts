import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID tidak valid');

	const divisi = await prisma.devisi.findUnique({ where: { id } });
	if (!divisi) throw error(404, 'Divisi tidak ditemukan');

	return { divisi };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const nama = (formData.get('nama') as string)?.trim();
		const namaLengkap = (formData.get('namaLengkap') as string)?.trim();
		const logoUrl = (formData.get('logoUrl') as string)?.trim();
		const thumbnailUrl = (formData.get('thumbnailUrl') as string)?.trim() || null;
		const deskripsi = (formData.get('deskripsi') as string)?.trim();

		// Validasi
		const errors: Record<string, string> = {};
		if (!nama) errors.nama = 'Nama divisi wajib diisi';
		if (!namaLengkap) errors.namaLengkap = 'Nama lengkap wajib diisi';
		if (!logoUrl) errors.logoUrl = 'URL logo wajib diisi';
		if (!deskripsi) errors.deskripsi = 'Deskripsi wajib diisi';

		// Cek nama unik (exclude divisi saat ini)
		if (nama) {
			const existing = await prisma.devisi.findFirst({
				where: { nama, id: { not: id } }
			});
			if (existing) errors.nama = 'Nama divisi sudah digunakan oleh divisi lain';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				values: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi }
			});
		}

		try {
			await prisma.devisi.update({
				where: { id },
				data: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi }
			});
		} catch (e) {
			return fail(500, {
				error: 'Gagal menyimpan ke database',
				values: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi }
			});
		}

		throw redirect(303, '/admin/dashboard/devisi');
	}
};
