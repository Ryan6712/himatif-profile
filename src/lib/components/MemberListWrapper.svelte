<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		jabatan = 'himatif',
		icon,
		children
	}: { jabatan?: string; icon: Snippet; children: Snippet } = $props();
</script>

<div class="wrapper">
	<div
		class="title-wrapper gradient-border-bottom relative mb-6 flex flex-row items-center gap-4 pb-3"
	>
		<div class="icon-container flex items-center justify-center">
			{@render icon()}
		</div>
		<h1 class="text-2xl font-bold tracking-wide text-title-text">{jabatan}</h1>
	</div>

	<div class="content container">
		{@render children()}
	</div>
</div>
