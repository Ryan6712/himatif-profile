<script lang="ts">
	import '../layout.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutData } from './$types';
  	import type { Snippet } from 'svelte';

	let { children, data }: { data: LayoutData; children: Snippet} = $props();

	let logoUrl = $derived(data.logo?.logoSmallUrl)
	
</script>

<Navbar logoUrl={logoUrl}/>
<main class="flex flex-col min-h-screen bg-background justify-center items-center ">
	{@render children()}
</main>
<Footer logoUrl={logoUrl}/>


<style>
	* {
    color: var(--color-primary-text);
}
</style>