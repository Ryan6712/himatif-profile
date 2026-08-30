<script lang="ts">
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { Menu, X, ArrowRight } from '@lucide/svelte';

	let isOpen = $state(false);

	interface NavLink {
		name: string;
		path: string;
	}

	let { logoUrl } = $props();

	let navItems: NavLink[] = [
		{
			name: 'home',
			path: '/'
		},
		{
			name: 'member',
			path: '/member'
		},
		{
			name: 'program kerja',
			path: '/proker'
		},
		{
			name: 'devisi',
			path: '/devisi'
		}
	];

	const toggle = (): void => {
		isOpen = isOpen ? false : true;
	};

	if (page.url.pathname) isOpen = false;
</script>

<nav
	class="fixed inset-x-0 top-6 z-50 mx-auto max-w-7xl rounded-full border border-primary/20 bg-surface/80 px-2 py-1.5 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-surface/95"
	style="box-shadow: 0 10px 40px -10px rgba(123, 237, 79, 0.15);"
>
	<div class="container px-4">
		<div class="flex items-center justify-between align-middle">
			<div class="logo flex shrink-0 items-center">
				<a href="/" class="group flex items-center gap-2">
					<!-- Logo 215x35 aspect ratio ~6:1 -->
					<img
						src={logoUrl}
						alt="HIMATIF Logo"
						width="215"
						height="35"
						class="h-[35px] w-auto max-w-[180px] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105 md:max-w-[215px]"
					/>
				</a>
			</div>

			<ul class="hidden items-center gap-1 md:flex">
				{#each navItems as item (item.name)}
					<li>
						<a
							href={item.path}
							class="nav-link relative rounded-full px-5 py-2.5 text-sm font-semibold text-primary-text capitalize transition-all duration-300 hover:bg-primary/5 hover:text-secondary"
							class:active={page.url.pathname == item.path}
						>
							{item.name}
							{#if page.url.pathname == item.path}
								<span
									class="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-secondary"
								></span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>

			<a
				href="mailto:himatif@stmik-yadika.ac.id"
				class="btn-cta pointer-events-auto hidden cursor-pointer items-center gap-2 px-6 py-2.5 text-sm font-bold md:flex"
				data-sveltekit-reload
				rel="external"
			>
				Hubungi Kami
			</a>

			<button
				onclick={toggle}
				aria-label="Toggle navigation menu"
				aria-expanded={isOpen}
				aria-controls="mobile-menu"
				class="pointer-events-auto relative flex h-10 w-10 flex-col items-center justify-center rounded-full bg-primary/10 text-secondary transition-colors hover:bg-primary/20 md:hidden"
			>
				<Menu size={20} />
			</button>
		</div>
	</div>
</nav>

{#if isOpen}
	<div
		class="fixed inset-0 z-30 bg-title-text/40 backdrop-blur-md md:hidden"
		in:fade={{ duration: 300 }}
		out:fade={{ duration: 150 }}
	></div>
	<div
		id="mobile-menu"
		class="fixed top-0 right-0 z-100 flex h-full min-h-screen w-[85vw] max-w-sm flex-col bg-surface/95 pb-6 backdrop-blur-xl md:hidden"
		style="box-shadow: -20px 0 40px rgba(26, 36, 18, 0.1);"
		in:fly={{ x: 300, duration: 400, opacity: 1 }}
		out:fly={{ x: 300, duration: 300, opacity: 1 }}
	>
		<div class="flex h-20 w-full shrink-0 items-center justify-between px-6">
			<img
				src={logoUrl}
				alt="HIMATIF Logo"
				width="215"
				height="35"
				class="h-[35px] w-auto max-w-[150px] object-contain"
			/>
			<button
				onclick={toggle}
				aria-label="Close navigation menu"
				class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-secondary transition-colors hover:bg-primary/20"
			>
				<X size={20} />
			</button>
		</div>

		<div class="mb-6 px-6">
			<div class="h-px w-full bg-linear-to-r from-primary/30 to-transparent"></div>
		</div>

		<ul class="flex flex-col gap-2 px-4 text-primary-text">
			{#each navItems as item (item.name)}
				<li>
					<a
						href={item.path}
						class="mobile-link group flex items-center justify-between rounded-2xl px-6 py-4 text-lg font-semibold capitalize transition-all duration-300 {page
							.url.pathname == item.path
							? 'bg-primary/15 text-secondary'
							: 'hover:bg-primary/5'}"
					>
						{item.name}
						<ArrowRight
							size={18}
							class="-translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 {page
								.url.pathname == item.path
								? 'translate-x-0 text-secondary opacity-100'
								: ''}"
						/>
					</a>
				</li>
			{/each}
		</ul>

		<div class="mt-auto px-6">
			<div class="glass-card mb-6 rounded-2xl p-6 text-center">
				<p class="mb-4 text-sm font-medium text-title-text/80">
					Punya pertanyaan atau ingin berkolaborasi?
				</p>
				<a
					href="mailto:himatif@stmik-yadika.ac.id"
					class="btn-cta flex w-full items-center justify-center gap-2 py-3.5 shadow-lg"
					data-sveltekit-reload
				>
					Hubungi Kami
				</a>
			</div>
		</div>
	</div>
{/if}

<style>
	.active {
		color: var(--color-secondary);
		background: rgba(123, 237, 79, 0.1);
	}
</style>
