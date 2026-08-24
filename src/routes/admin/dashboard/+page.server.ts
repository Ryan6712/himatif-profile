import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";

export const load: PageServerLoad = async () => {
  // Ambil semua statistik secara paralel untuk efisiensi
  const [
    devisiCount,
    memberCount,
    prokerCount,
    prokerPublished,
    recentProker
  ] = await Promise.all([
    prisma.devisi.count(),
    prisma.member.count(),
    prisma.proker.count(),
    prisma.proker.count({ where: { publishedAt: { not: null } } }),
    prisma.proker.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        date: true,
      },
    }),
  ]);

  return {
    stats: {
      devisiCount,
      memberCount,
      prokerCount,
      prokerPublished,
      prokerDraft: prokerCount - prokerPublished,
    },
    recentProker,
  };
};