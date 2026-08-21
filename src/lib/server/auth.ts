import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.ts";
import { username } from "better-auth/plugins";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mysql", 
    }),
    emailAndPassword: {
        enabled: true
    },
    plugins:[
        username()
    ]
});