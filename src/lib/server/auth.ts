import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.ts";
import { username } from "better-auth/plugins";
import { BETTER_AUTH_URL } from "$env/static/private";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mysql", 
    }),
    emailAndPassword: {
        enabled: true
    },
    plugins:[
        username()
    ],
    trustedOrigins: [
        BETTER_AUTH_URL,
    ],
});