<script lang="ts">
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { Menu, X } from '@lucide/svelte';

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
	class="fixed inset-x-0 top-4 z-50 mx-auto max-w-7xl rounded-full border border-tertiary/40 bg-surface/70 py-1 backdrop-blur-xl"
	style="box-shadow: var(--shadow-card-md);"
>
	<div class="container">
		<div class="flex items-center justify-between align-middle">
			<div class="logo flex shrink-0 items-center">
				<a href="/">
					<!-- Logo 215x35 aspect ratio ~6:1 -->
					<img
						src={logoUrl}
						alt="HIMATIF Logo"
						width="215"
						height="35"
						class="h-[35px] w-[215px] object-fill drop-shadow-sm drop-shadow-primary/60"
					/>
				</a>
			</div>
			<ul class="hidden items-center gap-8 md:flex">
				{#each navItems as item (item.name)}
					<li>
						<a
							href={item.path}
							class="nav-link capitalize hover:text-secondary"
							class:active={page.url.pathname == item.path}>{item.name}</a
						>
					</li>
				{/each}
			</ul>
			<button class="btn-cta pointer-events-auto hidden cursor-pointer px-5 py-2 md:block">
				<a href="mailto:himatif@stmik-yadika.ac.id" data-sveltekit-reload rel="external">
					Hubungi kami
				</a>
			</button>

			<button
				onclick={toggle}
				aria-label="Toggle navigation menu"
				aria-expanded={isOpen}
				aria-controls="mobile-menu"
				class="btn btn-primary pointer-events-auto relative flex h-8 w-8 flex-col items-center justify-center rounded-full md:hidden"
			>
				<Menu />
			</button>
		</div>
	</div>
</nav>

{#if isOpen}
	<div
		class="fixed inset-0 z-30 bg-title-text/20 blur backdrop-blur-sm md:hidden"
		in:fade={{ duration: 300 }}
		out:fade={{ duration: 150 }}
	></div>
	<div
		id="mobile-menu"
		class="fixed top-0 right-0 z-100 flex h-full min-h-screen w-80 flex-col bg-surface/90 pb-4 backdrop-blur-xl md:hidden"
		style="box-shadow: var(--shadow-card-xl);"
		in:fly={{ x: 300, duration: 400 }}
		out:fly={{ x: 300, duration: 300 }}
	>
		<div class="flex h-16 w-full shrink-0 items-center justify-between p-3">
			<img
				src={logoUrl}
				alt="HIMATIF Logo"
				width="215"
				height="35"
				class="h-[35px] w-[215px] object-fill"
			/>
			<button
				onclick={toggle}
				aria-label="Toggle navigation menu"
				aria-controls="mobile-menu"
				class="btn btn-primary h-8 w-8 rounded-full p-2 transition-colors hover:bg-primary/20"
			>
				<X />
			</button>
		</div>
		<div
			class="mx-4 mb-4 h-px bg-linear-to-r from-primary/40 via-secondary/30 to-transparent"
		></div>
		<ul class="container mt-2 flex flex-col text-primary-text">
			{#each navItems as item (item.name)}
				<li><a href={item.path} class="mobile-link text-lg capitalize">{item.name}</a></li>
			{/each}
		</ul>
		<div class="mx-4 mt-auto">
			<button class="btn-cta w-full px-6 py-3">
				<a href="mailto:himatif@stmik-yadika.ac.id" data-sveltekit-reload> Hubungi kami </a>
			</button>
		</div>
	</div>
{/if}

<style>
	.nav-link {
		position: relative;
		transition: color var(--duration-normal) var(--ease-out-expo);
	}
	.nav-link::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 50%;
		width: 0;
		height: 2px;
		background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
		border-radius: 2px;
		transition:
			width var(--duration-normal) var(--ease-out-expo),
			left var(--duration-normal) var(--ease-out-expo);
	}
	.nav-link:hover::after {
		width: 100%;
		left: 0;
	}
	.active {
		color: var(--color-secondary);
		background: rgba(123, 237, 79, 0.15);
		padding: 4px 12px;
		border-radius: 9999px;
		font-weight: 600;
	}
	.active::after {
		display: none;
	}

	.mobile-link {
		display: block;
		padding: 10px 16px;
		border-radius: 12px;
		transition: all var(--duration-fast) var(--ease-out-expo);
	}
	.mobile-link:hover {
		background: rgba(123, 237, 79, 0.12);
		padding-left: 24px;
	}
</style>
