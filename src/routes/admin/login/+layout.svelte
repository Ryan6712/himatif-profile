<script lang="ts">
	import '../../layout.css';

	const { children } = $props();
</script>

<main class="min-h-screen bg-background">
	{@render children()}
</main>

<style>
	* {
		color: var(--color-primary-text);
	}
</style>
