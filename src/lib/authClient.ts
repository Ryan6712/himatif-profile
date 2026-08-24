import { PUBLIC_BETTER_AUTH_URL } from "$env/static/public"
import { createAuthClient } from "better-auth/client";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [ usernameClient() ],
    baseURL: PUBLIC_BETTER_AUTH_URL,
})