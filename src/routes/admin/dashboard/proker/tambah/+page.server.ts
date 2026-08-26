import type { Actions } from "./$types";
import { prisma } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";
import { generateSlug } from "$lib/utils/slug";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const title = (formData.get("title") as string)?.trim();
    const dateStr = formData.get("date") as string;
    const thumbnailUrl = (formData.get("thumbnailUrl") as string)?.trim() || null;
    const description = (formData.get("description") as string)?.trim();
    const content = (formData.get("content") as string) || "";
    let slug = (formData.get("slug") as string)?.trim();
    
    // mendeteksi aksi form dari nilai submit form hidden input
    const isPublishing = formData.get("isPublishing") === "true";

    // Auto-generate slug jika kosong
    if (!slug && title) {
      slug = generateSlug(title);
    }

    // Validasi
    const errors: Record<string, string> = {};
    if (!title) errors.title = "Judul wajib diisi";
    if (!dateStr) errors.date = "Tanggal wajib diisi";
    if (!description) errors.description = "Deskripsi singkat wajib diisi";
    if (!content || content === "<p></p>") errors.content = "Konten wajib diisi"; // tiptap default empty state
    if (!slug) errors.slug = "Slug wajib diisi";

    // Validasi unik
    if (title) {
      const existingTitle = await prisma.proker.findUnique({ where: { title } });
      if (existingTitle) errors.title = "Judul sudah digunakan";
    }
    if (slug) {
      const existingSlug = await prisma.proker.findUnique({ where: { slug } });
      if (existingSlug) errors.slug = "Slug sudah digunakan";
    }

    // Validasi date format
    let date: Date | null = null;
    if (dateStr) {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) errors.date = "Format tanggal tidak valid";
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { title, date: dateStr, thumbnailUrl, description, content, slug },
      });
    }

    try {
        await prisma.proker.create({
            data: {
                title,
                date: date!,
                thumbnailUrl,
                description,
                content,
                slug,
                publishedAt: isPublishing ? new Date() : null,
            },
        });
    } catch(e) {
        return fail(500, { error: "Terjadi kesalahan server saat menyimpan artikel." })
    }

    throw redirect(303, "/admin/dashboard/proker");
  },
};