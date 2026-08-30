import nodemailer from 'nodemailer';
import 'dotenv/config';

// Setup Transporter SMTP
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'smtp.gmail.com',
	port: Number(process.env.SMTP_PORT) || 587,
	secure: process.env.SMTP_SECURE === 'true', // true untuk port 465, false untuk port lain
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS // Pastikan ini menggunakan App Password dari Google jika pakai Gmail
	}
});

export const sendOTP = async (targetEmail: string, otpCode: string) => {
	try {
		const info = await transporter.sendMail({
			from: `"HIMATIF ITB Yadika" <${process.env.SMTP_USER}>`,
			to: targetEmail,
			subject: 'Kode Verifikasi Perubahan Sandi - HIMATIF',
			text: `Halo, ada permintaan perubahan kata sandi untuk akun administrator HIMATIF. Kode OTP Anda adalah: ${otpCode}. Kode ini berlaku selama 5 menit. Jika bukan Anda, abaikan email ini.`,
			html: `
            <div style="font-family: Arial, sans-serif; background-color: #EDF2E4; padding: 20px;">
                <div style="max-w: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; border-top: 5px solid #7BED4F;">
                    <h2 style="color: #1A2412;">Verifikasi Keamanan Akun HIMATIF</h2>
                    <p style="color: #3B4A33; font-size: 16px;">
                        Seseorang (kemungkinan besar Anda) telah meminta kode verifikasi untuk mereset/mengganti kata sandi. 
                        Gunakan kode berikut untuk menyelesaikan proses.
                    </p>
                    <div style="background: #F8FAF5; border: 1px solid #7BED4F; border-radius: 8px; padding: 15px; text-align: center; margin: 25px 0;">
                        <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2D9B5A;">${otpCode}</span>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        Kode ini akan hangus dalam waktu <strong>5 menit</strong>. Jangan bagikan kepada siapa pun.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="color: #aaa; font-size: 12px; text-align: center;">
                        Email ini dikirim secara otomatis oleh Sistem Administrator HIMATIF ITB Yadika.
                    </p>
                </div>
            </div>
            `
		});

		console.log('Message sent: %s', info.messageId);
		return true;
	} catch (error) {
		console.error('Gagal mengirim email OTP:', error);
		return false;
	}
};
