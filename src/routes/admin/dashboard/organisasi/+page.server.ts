import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const organization = await prisma.organization.findUnique({
		where: { id: 1 }
	});
	return { organization };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const nama = (formData.get('nama') as string)?.trim();
		const namaLengkap = (formData.get('namaLengkap') as string)?.trim();
		const visi = (formData.get('visi') as string)?.trim();
		const misiStr = (formData.get('misi') as string)?.trim();
		const tujuan = (formData.get('tujuan') as string)?.trim();
		const logoSmallUrl = (formData.get('logoSmallUrl') as string)?.trim();
		const logoBigUrl = (formData.get('logoBigUrl') as string)?.trim();

		// Validasi
		const errors: Record<string, string> = {};
		if (!nama) errors.nama = 'Nama wajib diisi';
		if (!namaLengkap) errors.namaLengkap = 'Nama lengkap wajib diisi';
		if (!visi) errors.visi = 'Visi wajib diisi';
		if (!misiStr) errors.misi = 'Misi wajib diisi';
		if (!tujuan) errors.tujuan = 'Tujuan wajib diisi';
		if (!logoSmallUrl) errors.logoSmallUrl = 'URL Logo Kecil wajib diisi';
		if (!logoBigUrl) errors.logoBigUrl = 'URL Logo Besar wajib diisi';

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				values: { nama, namaLengkap, visi, misi: misiStr, tujuan, logoSmallUrl, logoBigUrl }
			});
		}

		// Parse misi input (dari textarea) ke JSON array
		// Asumsinya tiap baris adalah satu item misi
		const misiArray = misiStr
			.split('\n')
			.map((s) => s.trim())
			.filter(Boolean);
		const misiJsonString = JSON.stringify(misiArray);

		try {
			await prisma.organization.upsert({
				where: { id: 1 },
				update: {
					nama,
					namaLengkap,
					visi,
					misi: misiJsonString,
					tujuan,
					logoSmallUrl,
					logoBigUrl
				},
				create: {
					id: 1,
					nama,
					namaLengkap,
					visi,
					misi: misiJsonString,
					tujuan,
					logoSmallUrl,
					logoBigUrl
				}
			});

			return { success: true, message: 'Data organisasi berhasil diperbarui' };
		} catch (e) {
			return fail(500, { error: 'Terjadi kesalahan sistem saat menyimpan.' });
		}
	}
};
