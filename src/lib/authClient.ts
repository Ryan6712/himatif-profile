import { createAuthClient } from "better-auth/client";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [ usernameClient() ],
    baseURL: "http://localhost:5173",
})