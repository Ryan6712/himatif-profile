<script lang="ts">
	import '../layout.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { data: LayoutData; children: Snippet } = $props();

	let logoUrl = $derived(data.logo?.logoSmallUrl);
</script>

<Navbar {logoUrl} />
<main class="flex min-h-screen flex-col items-center justify-center bg-background">
	{@render children()}
</main>
<Footer {logoUrl} />

<style>
	* {
		color: var(--color-primary-text);
	}
</style>
