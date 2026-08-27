<script lang="ts">
	let { data } = $props();

	const proker = $derived(data.proker);
	// Sekarang content sudah berupa HTML langsung dari Tiptap
	const htmlContent = $derived(proker?.content || '');

	function formatDate(date: string | Date | null) {
		if (!date) return 'Tanggal tidak tersedia';
		const d = new Date(date);
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{proker?.title || 'Program Kerja'} - HIMATIF</title>
</svelte:head>

{#if proker}
	<article class="section stack-lg container mt-7 px-3">
		<header class="stack-sm mb-8">
			<a
				href="/proker"
				class="inline-flex items-center gap-1 text-sm opacity-60 transition-colors hover:text-secondary"
			>
				<span>&larr;</span> Kembali ke Program Kerja
			</a>
			<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-title-text">
				{proker.title}
			</h1>
			<time class="mt-2 block text-sm font-semibold text-secondary">
				{formatDate(proker.date)}
			</time>
		</header>

		{#if proker.thumbnailUrl}
			<div
				class="relative mx-auto mb-8 aspect-video w-full max-w-4xl overflow-hidden rounded-2xl shadow-md"
			>
				<img
					src={proker.thumbnailUrl}
					alt={proker.title}
					width="896"
					height="504"
					loading="lazy"
					decoding="async"
					class="absolute inset-0 h-full w-full object-cover"
				/>
			</div>
		{/if}

		<div class="prose prose-lg max-w-none prose-img:rounded-xl">
			{@html htmlContent}
		</div>
	</article>
{:else}
	<div class="section container mt-10 px-3 text-center">
		<h1 class="text-2xl font-bold">Program kerja tidak ditemukan.</h1>
		<a href="/proker" class="mt-4 inline-block text-secondary">Kembali ke list program kerja</a>
	</div>
{/if}
