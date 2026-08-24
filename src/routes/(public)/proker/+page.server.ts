import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";

export const load: PageServerLoad = async () => {
  const prokerList = await prisma.proker.findMany({
    orderBy: {
      date: "asc",
    },
  });

  return {
    prokerList,
  };
};