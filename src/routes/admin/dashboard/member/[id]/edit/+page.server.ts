import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import { member_memberType } from '$lib/server/generated/prisma/client.js';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (isNaN(id)) throw error(400, 'ID tidak valid');

	const [member, devisiList] = await Promise.all([
		prisma.member.findUnique({ where: { id } }),
		prisma.devisi.findMany({
			select: { id: true, nama: true },
			orderBy: { nama: 'asc' }
		})
	]);

	if (!member) throw error(404, 'Anggota tidak ditemukan');

	return { member, devisiList };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();

		const name = (formData.get('name') as string)?.trim();
		const imageUrl = (formData.get('imageUrl') as string)?.trim();
		const memberTypeRaw = formData.get('memberType') as string;
		const devisiIdRaw = formData.get('devisiId') as string;

		// Validasi
		const errors: Record<string, string> = {};
		if (!name) errors.name = 'Nama wajib diisi';
		if (!imageUrl) errors.imageUrl = 'URL foto wajib diisi';

		let memberType: member_memberType = member_memberType.REGULAR;
		if (
			!memberTypeRaw ||
			!Object.values(member_memberType).includes(memberTypeRaw as member_memberType)
		) {
			errors.memberType = 'Tipe anggota tidak valid';
		} else {
			memberType = memberTypeRaw as member_memberType;
		}

		// Cek unik
		if (name) {
			const existing = await prisma.member.findFirst({
				where: { name, id: { not: id } }
			});
			if (existing) errors.name = 'Nama anggota sudah terdaftar oleh anggota lain';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				values: { name, imageUrl, memberType: memberTypeRaw, devisiId: devisiIdRaw }
			});
		}

		const devisiId =
			devisiIdRaw && memberType !== 'BPH' && memberType !== 'ALUMNI' ? Number(devisiIdRaw) : null;

		try {
			await prisma.member.update({
				where: { id },
				data: {
					name,
					imageUrl,
					memberType,
					devisiId
				}
			});
		} catch (e) {
			return fail(500, {
				error: 'Gagal menyimpan ke database',
				values: { name, imageUrl, memberType: memberTypeRaw, devisiId: devisiIdRaw }
			});
		}

		throw redirect(303, '/admin/dashboard/member');
	}
};
