import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const proker = await prisma.proker.findUnique({
    where: {
      slug: params.slug,
    },
  });

  // Jika tidak ditemukan atau belum dipublish (bisa diadjust kalau admin mau view draft)
  if (!proker) {
    throw error(404, "Program kerja tidak ditemukan");
  }

  return {
    proker,
  };
};