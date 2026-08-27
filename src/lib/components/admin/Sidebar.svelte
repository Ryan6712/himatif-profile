<script lang="ts">
	import { page } from '$app/state'; //pastikan pakai app/state karena store sudah kadaluarsa dan hapus $ pada varibale page yang dipanggil kalau pakai $app/state gk butuh $
	import {
		LayoutDashboard,
		Building2,
		Users,
		UserRound,
		Newspaper,
		Settings,
		LogOut
	} from '@lucide/svelte';
	import { authClient } from '$lib/authClient';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { isOpen, closeSidebar } = $props<{
		isOpen: boolean;
		closeSidebar: () => void;
	}>();

	const menuItems = [
		{ name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
		{ name: 'Organisasi', path: '/admin/dashboard/organisasi', icon: Building2 },
		{ name: 'Divisi', path: '/admin/dashboard/devisi', icon: Users },
		{ name: 'Anggota', path: '/admin/dashboard/member', icon: UserRound },
		{ name: 'Program Kerja', path: '/admin/dashboard/proker', icon: Newspaper },
		{ name: 'Pengaturan Akun', path: '/admin/dashboard/pengaturan', icon: Settings }
	];

	async function handleLogout() {
		await authClient.signOut();
		goto(resolve('/admin/login'));
	}
</script>

<!-- Backdrop untuk mobile -->
{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
		onclick={closeSidebar}
		onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
		role="button"
		tabindex="0"
	></div>
{/if}

<!-- Sidebar Container -->
<aside
	class="glass fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-primary/10 bg-surface transition-transform duration-300 ease-in-out lg:translate-x-0"
	class:-translate-x-full={!isOpen}
	class:translate-x-0={isOpen}
>
	<!-- Brand / Logo -->
	<div class="flex h-16 shrink-0 items-center border-b border-primary/10 px-6">
		<h1 class="gradient-text text-2xl font-extrabold tracking-tight">HIMATIF</h1>
	</div>

	<!-- Navigation Menu -->
	<div class="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
		<span class="mb-2 ml-2 text-xs font-bold tracking-wider text-secondary uppercase"
			>Menu Utama</span
		>
		{#each menuItems as item (item.name)}
			{@const isActive =
				page.url.pathname === item.path ||
				(page.url.pathname.startsWith(item.path) && item.path !== '/admin/dashboard')}
			<a
				href={item.path}
				onclick={closeSidebar}
				class="smooth-transition flex items-center gap-3 rounded px-3 py-3 text-primary-text opacity-70 hover:bg-primary/75 hover:opacity-100"
				class:bg-primary={isActive}
				class:bg-opacity-20={isActive}
				class:text-secondary={isActive}
				class:font-bold={isActive}
				class:opacity-100={isActive}
				class:shadow-sm={isActive} //style di !isactive tidak perlu lewat sini kan dari awal sudah gk aktif biarkan taruh distyle biasa nanti akan ketimpah oleh yang active sendiri. atau kalau style ribet buat class css aja sendiri
			>
				<item.icon class="h-5 w-5" />
				<span>{item.name}</span>
			</a>
		{/each}
	</div>

	<!-- Bottom Action (Logout) -->
	<div class="shrink-0 border-t border-primary/10 p-4">
		<button
			onclick={handleLogout}
			class="smooth-transition flex w-full items-center justify-center gap-2 rounded bg-red-500/10 px-4 py-3 font-bold text-red-600 hover:bg-red-500/20"
		>
			<LogOut class="h-5 w-5" />
			<span>Keluar</span>
		</button>
	</div>
</aside>
