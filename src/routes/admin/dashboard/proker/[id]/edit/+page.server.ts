import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import { generateSlug } from '$lib/utils/slug';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID tidak valid');

	const proker = await prisma.proker.findUnique({ where: { id } });
	if (!proker) throw error(404, 'Program kerja tidak ditemukan');

	return { proker };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const title = (formData.get('title') as string)?.trim();
		const dateStr = formData.get('date') as string;
		const thumbnailUrl = (formData.get('thumbnailUrl') as string)?.trim() || null;
		const description = (formData.get('description') as string)?.trim();
		const content = (formData.get('content') as string) || '';
		let slug = (formData.get('slug') as string)?.trim();

		// Mendeteksi aksi spesifik dari hidden field status yang dilempar Svelte
		const publishAction = formData.get('publishAction') as
			'publish' | 'unpublish' | 'save-draft' | 'save-published';

		// Auto-generate slug jika tiba-tiba dikosongkan
		if (!slug && title) {
			slug = generateSlug(title);
		}

		// Validasi input
		const errors: Record<string, string> = {};
		if (!title) errors.title = 'Judul wajib diisi';
		if (!dateStr) errors.date = 'Tanggal wajib diisi';
		if (!description) errors.description = 'Deskripsi singkat wajib diisi';
		if (!content || content === '<p></p>') errors.content = 'Konten wajib diisi';
		if (!slug) errors.slug = 'Slug wajib diisi';

		// Cek unik constraint tapi kecualikan id yg lagi kita edit
		if (title) {
			const existing = await prisma.proker.findFirst({
				where: { title, id: { not: id } }
			});
			if (existing) errors.title = 'Judul sudah digunakan oleh program kerja lain';
		}
		if (slug) {
			const existing = await prisma.proker.findFirst({
				where: { slug, id: { not: id } }
			});
			if (existing) errors.slug = 'Slug sudah digunakan';
		}

		// Parse tanggal
		let date: Date | null = null;
		if (dateStr) {
			date = new Date(dateStr);
			if (isNaN(date.getTime())) errors.date = 'Format tanggal tidak valid';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				values: { title, date: dateStr, thumbnailUrl, description, content, slug }
			});
		}

		// Menentukan Status Published At Berdasarkan Button Yang Ditekan
		let publishedAt: Date | null | undefined = undefined; // undefined = tidak ada perubahan db pada kolom ini

		if (publishAction === 'publish') {
			// dari draft -> publish
			publishedAt = new Date();
		} else if (publishAction === 'unpublish') {
			// dari publish -> draft
			publishedAt = null;
		} else if (publishAction === 'save-draft') {
			// tetep draft
			publishedAt = null;
		}
		// jika "save-published", kolom publishedAt tidak diubah-ubah nilainya (tetap tanggal asli saat publish)

		try {
			await prisma.proker.update({
				where: { id },
				data: {
					title,
					date: date!,
					thumbnailUrl,
					description,
					content,
					slug,
					...(publishedAt !== undefined ? { publishedAt } : {})
				}
			});
		} catch (e) {
			return fail(500, { error: 'Terjadi kesalahan server saat memperbarui data.' });
		}

		throw redirect(303, '/admin/dashboard/proker');
	}
};
