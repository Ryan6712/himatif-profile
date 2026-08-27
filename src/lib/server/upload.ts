import { env } from '$env/dynamic/private';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: env.CLOUDINARY_CLOUD_NAME,
	api_key: env.CLOUDINARY_API_KEY,
	api_secret: env.CLOUDINARY_API_SECRET
});

export interface UploadOptions {
	folder?: string; // misal: "himatif/members"
	maxWidth?: number;
	maxHeight?: number;
	allowedFormats?: string[];
	maxSizeBytes?: number;
}

export interface UploadResult {
	url: string;
	publicId: string;
	width: number;
	height: number;
	format: string;
	bytes: number;
}

const DEFAULT_OPTIONS: UploadOptions = {
	folder: 'himatif/general',
	maxWidth: 1200,
	maxHeight: 1200,
	allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
	maxSizeBytes: 5 * 1024 * 1024 // 5MB
};

export async function uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	// Validasi format file
	const fileExt = file.name.split('.').pop()?.toLowerCase();
	if (fileExt && opts.allowedFormats && !opts.allowedFormats.includes(fileExt)) {
		throw new Error(`Format file tidak didukung. Gunakan: ${opts.allowedFormats.join(', ')}`);
	}

	// Validasi ukuran file
	if (opts.maxSizeBytes && file.size > opts.maxSizeBytes) {
		const maxMB = (opts.maxSizeBytes / (1024 * 1024)).toFixed(1);
		throw new Error(`Ukuran file terlalu besar. Maksimal ${maxMB}MB`);
	}

	// Convert File ke ArrayBuffer lalu Buffer untuk Cloudinary stream
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const result = await new Promise<any>((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					folder: opts.folder,
					resource_type: 'image',
					transformation: [
						{
							width: opts.maxWidth,
							height: opts.maxHeight,
							crop: 'limit', // Hanya memperkecil, tidak memperbesar gambar yang kecil
							quality: 'auto',
							fetch_format: 'auto' // Secara otomatis mengkonversi ke format web terkini (WebP/AVIF)
						}
					]
				},
				(error, result) => {
					if (error) reject(error);
					else resolve(result);
				}
			)
			.end(buffer);
	});

	return {
		url: result.secure_url,
		publicId: result.public_id,
		width: result.width,
		height: result.height,
		format: result.format,
		bytes: result.bytes
	};
}

export async function deleteImage(publicId: string): Promise<void> {
	if (publicId) {
		await cloudinary.uploader.destroy(publicId);
	}
}
