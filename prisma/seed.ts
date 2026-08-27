import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/lib/server/generated/prisma/client.js';
import { member_memberType as MemberType } from '../src/lib/server/generated/prisma/enums.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// --- Prisma Client Setup ---

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST || 'localhost',
	user: process.env.DATABASE_USER || 'root',
	password: process.env.DATABASE_PASSWORD || '',
	database: process.env.DATABASE_NAME || 'himatif_profile',
	port: Number(process.env.DATABASE_PORT || '3306')
});
const prisma = new PrismaClient({ adapter });

// --- Helper: slug generator ---
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

// --- Load JSON data ---
function loadJson<T>(filename: string): T {
	const filePath = join(rootDir, 'static', 'data', filename);
	const raw = readFileSync(filePath, 'utf-8');
	return JSON.parse(raw) as T;
}

// --- Types for JSON data ---
interface DevisiJson {
	nama: string;
	namaLengkap: string;
	logoUrl: string;
	thumbnailUrl: string;
	deskripsi: string;
}

interface MemberJson {
	name: string;
	position: string;
	imageUrl: string;
	devisi: string;
}

interface ProkerJson {
	title: string;
	date: string;
	thumbnail: string;
	description: string;
}

// --- Seed functions ---

async function seedOrganization() {
	console.log('Seeding Organization...');

	const visi =
		'Menjadi wadah yang mendorong kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa Teknologi Informasi untuk menjadi pemimpin masa depan di era digital.';

	const misi = JSON.stringify([
		'Menyelenggarakan kegiatan yang mendorong kolaborasi dan komunikasi antar mahasiswa Teknologi Informasi.',
		'Mengadakan kegiatan pembelajaran dan pelatihan untuk meningkatkan kemampuan dan keterampilan mahasiswa.',
		'Memberikan wadah bagi mahasiswa untuk mengeksplorasi minat dan bakat mereka dalam bidang teknologi informasi.'
	]);

	const tujuan =
		'Menjadi wadah yang mendorong kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa Teknologi Informasi untuk menjadi pemimpin masa depan di era digital.';

	await prisma.organization.upsert({
		where: { id: 1 },
		update: {
			visi,
			misi,
			tujuan
		},
		create: {
			id: 1,
			nama: 'HIMATIF',
			namaLengkap: 'Himpunan Mahasiswa Teknologi Informasi ITB Yadika Pasuruan',
			visi,
			misi,
			tujuan,
			logoSmallUrl: 'https://placehold.co/215x35/png?text=himatif',
			logoBigUrl: 'https://placehold.co/500x400/png?text=himatif'
		}
	});

	console.log('  -> Organization seeded (id: 1)');
}

async function seedDevisi() {
	console.log('Seeding Devisi...');

	const data = loadJson<{ devisi: DevisiJson[] }>('devisi.json');

	for (const d of data.devisi) {
		await prisma.devisi.upsert({
			where: { nama: d.nama },
			update: {
				namaLengkap: d.namaLengkap,
				logoUrl: d.logoUrl,
				thumbnailUrl: d.thumbnailUrl,
				deskripsi: d.deskripsi
			},
			create: {
				nama: d.nama,
				namaLengkap: d.namaLengkap,
				logoUrl: d.logoUrl,
				thumbnailUrl: d.thumbnailUrl,
				deskripsi: d.deskripsi
			}
		});
		console.log(`  -> Devisi "${d.nama}" seeded`);
	}
}

async function seedMembers() {
	console.log('Seeding Members...');

	const data = loadJson<{
		bph: MemberJson[];
		kadiv: MemberJson[];
		member: MemberJson[];
	}>('member.json');

	// Fetch all devisi to map by nama (case-insensitive)
	const allDevisi = await prisma.devisi.findMany();
	const devisiMap = new Map<string, number>();
	for (const d of allDevisi) {
		devisiMap.set(d.nama.toLowerCase(), d.id);
	}

	// Seed BPH members
	for (const m of data.bph) {
		await prisma.member.upsert({
			where: { name: m.name },
			update: {
				imageUrl: m.imageUrl,
				memberType: MemberType.BPH,
				devisiId: null
			},
			create: {
				name: m.name,
				imageUrl: m.imageUrl,
				memberType: MemberType.BPH,
				devisiId: null
			}
		});
		console.log(`  -> BPH "${m.name}" seeded`);
	}

	// Seed KADIV members
	for (const m of data.kadiv) {
		const devisiId = devisiMap.get(m.devisi.toLowerCase()) ?? null;
		await prisma.member.upsert({
			where: { name: m.name },
			update: {
				imageUrl: m.imageUrl,
				memberType: MemberType.KADIV,
				devisiId
			},
			create: {
				name: m.name,
				imageUrl: m.imageUrl,
				memberType: MemberType.KADIV,
				devisiId
			}
		});
		console.log(
			`  -> KADIV "${m.name}" seeded (devisi: ${m.devisi}${devisiId ? '' : ' - NOT FOUND, set null'})`
		);
	}

	// Seed regular members
	for (const m of data.member) {
		const isAlumni = m.devisi.toLowerCase() === 'alumni';
		const memberType = isAlumni ? MemberType.ALUMNI : MemberType.REGULAR;

		// Alumni dan devisi yang tidak ditemukan -> devisiId null
		let devisiId: number | null = null;
		if (!isAlumni) {
			devisiId = devisiMap.get(m.devisi.toLowerCase()) ?? null;
		}

		await prisma.member.upsert({
			where: { name: m.name },
			update: {
				imageUrl: m.imageUrl,
				memberType,
				devisiId
			},
			create: {
				name: m.name,
				imageUrl: m.imageUrl,
				memberType,
				devisiId
			}
		});

		const typeLabel = isAlumni ? 'ALUMNI' : 'REGULAR';
		const devisiNote = devisiId ? '' : ` - devisi "${m.devisi}" not mapped`;
		console.log(`  -> ${typeLabel} "${m.name}" seeded${devisiNote}`);
	}
}

async function seedProker() {
	console.log('Seeding Proker...');

	const data = loadJson<{ proker: ProkerJson[] }>('proker.json');

	for (const p of data.proker) {
		const slug = generateSlug(p.title);
		const isUpcoming = p.date.toLowerCase() === 'upcoming';

		// Upcoming -> set tanggal 1 tahun dari sekarang, publishedAt null (draft)
		// Non-upcoming -> parse tanggal, set publishedAt = tanggal (published)
		const date = isUpcoming ? new Date('2027-01-01') : new Date(p.date);
		const publishedAt = isUpcoming ? null : new Date(p.date);

		// Content: gunakan description sebagai markdown content (belum ada full content)
		const content = `# ${p.title}\n\n${p.description}`;

		await prisma.proker.upsert({
			where: { slug },
			update: {
				title: p.title,
				date,
				thumbnailUrl: p.thumbnail,
				description: p.description,
				content,
				publishedAt
			},
			create: {
				title: p.title,
				date,
				thumbnailUrl: p.thumbnail,
				description: p.description,
				content,
				slug,
				publishedAt
			}
		});

		const status = publishedAt ? 'published' : 'draft';
		console.log(`  -> Proker "${p.title}" seeded (slug: ${slug}, ${status})`);
	}
}

async function seedAdminUser() {
	console.log('Seeding Admin User...');

	// Cek apakah admin sudah ada
	const existingAdmin = await prisma.user.findFirst({
		where: { username: 'admin' }
	});

	if (existingAdmin) {
		console.log('  -> Admin user already exists, skipping');
		return;
	}

	// Buat admin user via better-auth instance langsung di seed
	try {
		const { betterAuth } = await import('better-auth');
		const { prismaAdapter } = await import('better-auth/adapters/prisma');
		const { username } = await import('better-auth/plugins');

		const auth = betterAuth({
			database: prismaAdapter(prisma, {
				provider: 'mysql'
			}),
			emailAndPassword: {
				enabled: true
			},
			plugins: [username()]
		});

		await auth.api.signUpEmail({
			body: {
				name: 'Admin HIMATIF',
				email: 'admin@himatif.ac.id',
				password: 'admin123',
				username: 'admin'
			}
		});
		console.log('  -> Admin user created:');
		console.log('     Email:    admin@himatif.ac.id');
		console.log('     Username: admin');
		console.log('     Password: admin123');
		console.log('     (GANTI PASSWORD INI DI PRODUCTION!)');
	} catch (error) {
		console.log('  -> Admin user creation status:', error);
	}
}

// --- Main ---
async function main() {
	console.log('=== HIMATIF Profile Database Seeder ===\n');

	try {
		await seedOrganization();
		console.log('');

		await seedDevisi();
		console.log('');

		await seedMembers();
		console.log('');

		await seedProker();
		console.log('');

		await seedAdminUser();
		console.log('');

		console.log('=== Seeding completed! ===');
	} catch (error) {
		console.error('Seeding failed:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
