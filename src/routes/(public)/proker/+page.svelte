<script lang="ts">
	let { data } = $props();

	const prokerList = $derived(data.prokerList || []);

	// helper format date
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
	<title>Program Kerja - HIMATIF ITB Yadika</title>
	<meta
		name="description"
		content="Daftar program kerja dan kegiatan HIMATIF ITB Yadika yang dirancang untuk mendorong kolaborasi, inovasi, dan pengembangan diri mahasiswa Teknologi Informasi."
	/>
</svelte:head>

<section class="bg-gradient-surface section relative mt-7 min-w-full overflow-hidden px-3">
	<div class="bg-dot-pattern pointer-events-none absolute inset-0"></div>
	<div class="header stack relative z-10 container mb-10 flex flex-col items-start justify-start">
		<h1 class="text-5xl font-extrabold tracking-tight text-title-text">
			Program <span class="gradient-text">Kerja</span>
		</h1>
		<h2 class="max-w-3xl text-lg leading-relaxed opacity-80">
			Program kerja HIMATIF ITB Yadika adalah inisiatif yang dirancang untuk mendorong kolaborasi,
			inovasi, dan pengembangan diri mahasiswa Teknologi Informasi. Setiap program kerja dirancang
			untuk memberikan pengalaman berharga, memperluas wawasan, dan membangun keterampilan yang
			relevan dengan dunia teknologi informasi.
		</h2>
	</div>
	<div class="proker-wrapper relative z-10 container mt-10 grid grid-cols-1 gap-6">
		{#each prokerList as item (item.id)}
			<div
				class="proker glass-card group hover-lift flex w-full flex-col items-start justify-center gap-6 rounded-2xl px-4 py-6 md:flex-row lg:justify-start"
				style="box-shadow: var(--shadow-card-md);"
			>
				<!-- Thumbnail 400x230 aspect ratio ~16:9 for responsive -->
				<div
					class="relative aspect-video w-full max-w-[400px] shrink-0 overflow-hidden rounded-xl md:w-1/3"
					style="box-shadow: var(--shadow-card);"
				>
					<img
						src={item.thumbnailUrl}
						alt={item.title}
						width="400"
						height="225"
						loading="lazy"
						decoding="async"
						class="absolute inset-0 h-full w-full object-cover"
					/>
				</div>
				<div class="desc flex w-full flex-1 flex-col">
					<span class="title text-2xl font-extrabold tracking-tight text-title-text"
						>{item.title}</span
					>
					<span class="date mt-2 text-sm font-semibold text-secondary">{formatDate(item.date)}</span
					>
					<p class="mt-5 max-w-2xl leading-relaxed opacity-85">{item.description}</p>
					<!-- Update to dynamic slug -->
					{#if item.publishedAt}
						<a
							href="/proker/{item.slug}"
							class="read-more mt-4 inline-flex items-center gap-1 font-semibold text-secondary"
							>baca selengkapnya <span
								class="transition-all duration-300 ease-in-out group-hover:ms-3">&rarr;</span
							></a
						>
					{:else}
						<a
							href="/proker/upcoming"
							class="read-more mt-4 inline-flex items-center gap-1 font-semibold text-secondary"
							>baca selengkapnya <span
								class="transition-all duration-300 ease-in-out group-hover:ms-3">&rarr;</span
							></a
						>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.read-more {
		position: relative;
		transition: color var(--duration-normal) var(--ease-out-expo);
	}
	.read-more::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 1.5px;
		background: var(--color-secondary);
		border-radius: 1px;
		transition: width var(--duration-normal) var(--ease-out-expo);
	}
	.read-more:hover::after {
		width: 70%;
	}
</style>
