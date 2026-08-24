import { prisma } from "$lib/server/db"
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
    const logoSmallUrl = await prisma.organization.findUnique({
        where: { id: 1 },
        select: {
            logoSmallUrl: true
        }
    });

    return {
        logo: logoSmallUrl
    }
};