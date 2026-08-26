import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || ""; 

  // Build where clause
  const where: any = {};

  if (search) {
    where.title = { contains: search };
  }

  if (status === "published") {
    where.publishedAt = { not: null };
  } else if (status === "draft") {
    where.publishedAt = null;
  }

  const [prokerList, totalCount] = await Promise.all([
    prisma.proker.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        date: true,
        thumbnailUrl: true,
        description: true,  // short description saja
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.proker.count({ where }),
  ]);

  return {
    prokerList,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
    filters: { search, status },
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get("id"));

    if (!id || isNaN(id)) return fail(400, { error: "ID tidak valid" });

    const proker = await prisma.proker.findUnique({ where: { id } });
    if (!proker) return fail(404, { error: "Program kerja tidak ditemukan" });

    try {
        await prisma.proker.delete({ where: { id } });
        return { success: true, message: `"${proker.title}" berhasil dihapus` };
    } catch(e) {
        return fail(500, { error: "Gagal menghapus data dari sistem."})
    }
  },

  togglePublish: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get("id"));

    if (!id || isNaN(id)) return fail(400, { error: "ID tidak valid" });

    const proker = await prisma.proker.findUnique({ where: { id } });
    if (!proker) return fail(404, { error: "Program kerja tidak ditemukan" });

    // Toggle logic
    const publishedAt = proker.publishedAt ? null : new Date();

    try {
        await prisma.proker.update({
            where: { id },
            data: { publishedAt },
        });

        const action = publishedAt ? "dipublish" : "dijadikan draft";
        return { success: true, message: `"${proker.title}" berhasil ${action}` };
    } catch(e) {
        return fail(500, { error: "Gagal merubah status publish."})
    }
  },
};