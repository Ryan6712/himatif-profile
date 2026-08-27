import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { uploadImage } from '$lib/server/upload';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Verifikasi keamanaan: pastikan endpoint hanya dipanggil oleh user (admin) yang sudah login
	if (!locals.user) {
		throw error(401, 'Anda tidak memiliki otorisasi untuk mengupload file.');
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const folder = (formData.get('folder') as string) || 'himatif/general';

		if (!file || !(file instanceof File)) {
			return json(
				{ success: false, message: 'File tidak ditemukan atau tidak valid.' },
				{ status: 400 }
			);
		}

		// Hanya menerima format gambar
		if (!file.type.startsWith('image/')) {
			return json({ success: false, message: 'File harus berupa gambar.' }, { status: 400 });
		}

		// Melakukan upload via Cloudinary Server function
		const result = await uploadImage(file, { folder });

		return json({
			success: true,
			data: {
				url: result.url,
				publicId: result.publicId,
				width: result.width,
				height: result.height
			}
		});
	} catch (err: any) {
		console.error('Upload error:', err);
		return json(
			{ success: false, message: err.message || 'Proses upload gagal.' },
			{ status: 400 }
		);
	}
};
