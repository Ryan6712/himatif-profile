// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			admin?: {
				id: number;
				username: string;
				email: string;
			};

			isAuthenticated: boolean;

			user?: {
				id: string;
				name: string;
				email: string;
				username?: string | null;
			};

			session?: {
				id: string;
				expiresAt: Date;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
