import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { sendOTP } from '$lib/server/mailer';

// Random 6-digit number generator
function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export const POST: RequestHandler = async ({ request, locals }) => {
	// Memastikan hanya user yang sedang login (Admin) yang bisa meminta OTP ganti password
	if (!locals.user) {
		return json({ success: false, message: 'Akses Ditolak' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const targetType = body.targetType as 'utama' | 'cadangan';

		// Ambil data User dari Database untuk mengecek email cadangan
		const user = await prisma.user.findUnique({
			where: { id: locals.user.id }
		});

		if (!user) {
			return json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
		}

		// Tentukan alamat email tujuan berdasarkan input 'targetType'
		let targetEmail = '';
		if (targetType === 'cadangan') {
			if (!user.backupEmail) {
				return json(
					{ success: false, message: 'Anda belum mendaftarkan email cadangan.' },
					{ status: 400 }
				);
			}
			targetEmail = user.backupEmail;
		} else {
			targetEmail = user.email; // Default fallback ke email utama
		}

		// Generate kode unik 6-digit
		const otpCode = generateOTP();

		// Atur OTP agar kadaluarsa dalam 5 menit
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

		// Gunakan tabel Verification untuk menyimpan OTP (mendompleng arsitektur Better-Auth)
		// identifier disini formatnya `reset-pass:USER_ID` agar tidak bentrok dengan aksi auth lain
		await prisma.verification.upsert({
			where: {
				id: `reset-${user.id}`
			},
			create: {
				id: `reset-${user.id}`,
				identifier: `reset-pass:${user.id}`,
				value: otpCode, // Pada implementasi asli yang lebih kompleks, ini harusnya di-hash (bcrypt/scrypt)
				expiresAt: expiresAt,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			update: {
				value: otpCode,
				expiresAt: expiresAt,
				updatedAt: new Date()
			}
		});

		// Panggil service Nodemailer
		const mailSent = await sendOTP(targetEmail, otpCode);

		if (!mailSent) {
			return json(
				{
					success: false,
					message: 'Gagal mengirimkan email. Periksa koneksi SMTP atau email yang dituju.'
				},
				{ status: 500 }
			);
		}

		// Kirim response masking email (menyembunyikan nama email utuh dari network tab demi privasi)
		const [namePart, domain] = targetEmail.split('@');
		const maskedEmail = `${namePart.substring(0, 2)}***@${domain}`;

		return json({
			success: true,
			message: `Kode OTP berhasil dikirim ke ${maskedEmail}`,
			expiresIn: 5 // untuk counter di FE
		});
	} catch (e: any) {
		return json(
			{ success: false, message: e.message || 'Terjadi kesalahan server' },
			{ status: 500 }
		);
	}
};
