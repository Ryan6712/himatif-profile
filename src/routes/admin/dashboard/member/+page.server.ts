import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { fail } from "@sveltejs/kit";
import { member_memberType } from "$lib/server/generated/prisma/client.js";

export const load: PageServerLoad = async ({ url }) => {
    // Query params for filter, search, pagination
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10; // 10 per page
    const search = url.searchParams.get("search") || "";
    const type = url.searchParams.get("type") || "";
    const devisiId = url.searchParams.get("devisi") || "";

    const where: any = {};

    if (search) {
        where.name = { contains: search };
    }

    if (type && Object.values(member_memberType).includes(type as member_memberType)) {
        where.memberType = type;
    }

    if (devisiId && !isNaN(Number(devisiId))) {
        where.devisiId = Number(devisiId);
    }

    const [members, totalCount, devisiList] = await Promise.all([
        prisma.member.findMany({
            where,
            include: { devisi: { select: { id: true, nama: true } } },
            orderBy: [
                { memberType: "desc" }, // Desc supaya BPH duluan, karena alfabet BPH ada di bawah KADIV/REGULAR
                { name: "asc" },
            ],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.member.count({ where }),
        prisma.devisi.findMany({
            select: { id: true, nama: true },
            orderBy: { nama: "asc" },
        }),
    ]);

    return {
        members,
        pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        },
        filters: { search, type, devisiId },
        devisiList,
    };
};

export const actions: Actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get("id"));

        if (!id || isNaN(id)) {
            return fail(400, { error: "ID tidak valid" });
        }

        const member = await prisma.member.findUnique({ where: { id } });
        if (!member) {
            return fail(404, { error: "Anggota tidak ditemukan" });
        }

        try {
            await prisma.member.delete({ where: { id } });
            return { success: true, message: `Anggota "${member.name}" berhasil dihapus` };
        } catch (error) {
            return fail(500, { error: `Terjadi kesalahan saat menghapus data. ${error}` });
        }
    },
};