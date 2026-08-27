<script lang="ts">
	import { Menu } from '@lucide/svelte';
	import { page } from '$app/state';

	interface User {
		name: string;
		email: string;
		username?: string | null;
	}

	let { toggleSidebar, user } = $props<{
		toggleSidebar: () => void;
		user: User; //pastikan ada interface jangan pakai any definisikan aja apa yang akan dipakai
	}>();

	// Map path to title
	const getPageTitle = (path: string) => {
		if (path.includes('organisasi')) return 'Organisasi';
		if (path.includes('devisi')) return 'Kelola Divisi';
		if (path.includes('member')) return 'Kelola Anggota';
		if (path.includes('proker')) return 'Program Kerja';
		if (path.includes('pengaturan')) return 'Pengaturan Akun';
		return 'Dashboard';
	};

	let pageTitle = $derived(getPageTitle(page.url.pathname));
</script>

<header
	class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-primary/10 bg-background/80 px-6 shadow-sm backdrop-blur-md"
>
	<div class="flex items-center gap-4">
		<!-- Mobile Menu Toggle -->
		<button
			onclick={toggleSidebar}
			class="smooth-transition rounded bg-primary/10 p-2 text-secondary hover:bg-primary/20 lg:hidden"
		>
			<Menu class="h-6 w-6" />
		</button>

		<h2 class="text-2xl font-extrabold tracking-tight text-title-text">{pageTitle}</h2>
	</div>

	<div
		class="flex items-center gap-4 rounded border border-primary/10 bg-surface px-4 py-1.5 shadow-sm"
	>
		<div class="hidden flex-col items-end sm:flex">
			<span class="text-sm leading-tight font-bold text-title-text"
				>{user?.name || user?.username || 'Admin'}</span
			>
			<span class="text-xs text-primary-text opacity-70">{user?.email}</span>
		</div>
		<!-- Note: user icon tetap bundar, sesuai instruksi, "kecuali button" dan biasanya icon profil wajar tetap bulat/full -->
		<div
			class="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/20 font-extrabold text-secondary shadow-inner"
		>
			{(user?.name || user?.username || 'A')[0].toUpperCase()}
		</div>
	</div>
</header>
