<script lang="ts">
	import './layout.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const { children } = $props();
</script>

<Navbar />
<main class="flex flex-col min-h-screen bg-background justify-center">
	{@render children()}
</main>
<Footer />


<style>
	* {
    color: var(--color-primary-text);
}
</style>