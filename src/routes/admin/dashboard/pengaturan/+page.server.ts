import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	return {
		user
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Tidak terautentikasi' });
		}

		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const username = (formData.get('username') as string)?.trim();
		const email = (formData.get('email') as string)?.trim();

		const errors: Record<string, string> = {};
		if (!name) errors.name = 'Nama lengkap wajib diisi';
		if (!username) errors.username = 'Username wajib diisi';
		if (!email) errors.email = 'Email wajib diisi';

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				profileErrors: errors,
				profileValues: { name, username, email }
			});
		}

		// Cek duplikasi username / email ke user lain
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ username }, { email }],
				NOT: { id: locals.user.id }
			}
		});

		if (existingUser) {
			return fail(400, {
				profileErrors: {
					name: '',
					username: existingUser.username === username ? 'Username sudah digunakan' : '',
					email: existingUser.email === email ? 'Email sudah digunakan' : ''
				},
				profileValues: { name, username, email }
			});
		}

		try {
			await prisma.user.update({
				where: { id: locals.user.id },
				data: {
					name,
					username,
					email
				}
			});

			return { success: true, message: 'Profil admin berhasil diperbarui!' };
		} catch (e) {
			return fail(500, { error: 'Gagal memperbarui profil admin' });
		}
	},

	updatePassword: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Tidak terautentikasi' });
		}

		const formData = await request.formData();
		const currentPassword = (formData.get('currentPassword') as string) || '';
		const newPassword = (formData.get('newPassword') as string) || '';
		const confirmPassword = (formData.get('confirmPassword') as string) || '';

		const errors: Record<string, string> = {};
		if (!currentPassword) errors.currentPassword = 'Password saat ini wajib diisi';
		if (!newPassword) errors.newPassword = 'Password baru wajib diisi';
		else if (newPassword.length < 6) errors.newPassword = 'Password baru minimal 6 karakter';
		if (newPassword !== confirmPassword) errors.confirmPassword = 'Konfirmasi password tidak cocok';

		if (Object.keys(errors).length > 0) {
			return fail(400, { passwordErrors: errors });
		}

		try {
			// Ubah password via Better-Auth API
			await auth.api.changePassword({
				headers: request.headers,
				body: {
					currentPassword,
					newPassword,
					revokeOtherSessions: true
				}
			});

			return { success: true, message: 'Password berhasil diubah!' };
		} catch (err: any) {
			const errorMsg = err?.message || 'Password saat ini salah atau gagal mengubah password';
			return fail(400, {
				passwordErrors: { currentPassword: errorMsg, newPassword: '', confirmPassword: '' }
			});
		}
	}
};
