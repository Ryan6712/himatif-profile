<script lang="ts">
	import '../../layout.css';

	const { children } = $props();
</script>

<main class="flex flex-col min-h-screen bg-background justify-center items-center ">
	{@render children()}
</main>



<style>
	* {
    color: var(--color-primary-text);
}
</style>