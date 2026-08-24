import type { Actions } from "./$types";
import { prisma } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const nama = (formData.get("nama") as string)?.trim();
    const namaLengkap = (formData.get("namaLengkap") as string)?.trim();
    const logoUrl = (formData.get("logoUrl") as string)?.trim();
    const thumbnailUrl = (formData.get("thumbnailUrl") as string)?.trim() || null;
    const deskripsi = (formData.get("deskripsi") as string)?.trim();

    // Validasi
    const errors: Record<string, string> = {};
    if (!nama) errors.nama = "Nama divisi wajib diisi";
    if (!namaLengkap) errors.namaLengkap = "Nama lengkap wajib diisi";
    if (!logoUrl) errors.logoUrl = "URL logo wajib diisi";
    if (!deskripsi) errors.deskripsi = "Deskripsi wajib diisi";

    // Cek nama unik
    if (nama) {
      const existing = await prisma.devisi.findUnique({ where: { nama } });
      if (existing) errors.nama = "Nama divisi sudah digunakan";
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi },
      });
    }

    try {
        await prisma.devisi.create({
            data: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi },
        });
    } catch(e) {
        return fail(500, {
            error: "Gagal menyimpan ke database",
            values: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi },
        })
    }

    throw redirect(303, "/admin/dashboard/devisi");
  },
};