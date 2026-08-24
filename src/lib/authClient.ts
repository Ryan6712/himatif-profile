import { BETTER_AUTH_URL } from "$env/static/private";
import { createAuthClient } from "better-auth/client";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [ usernameClient() ],
    baseURL: BETTER_AUTH_URL,
})