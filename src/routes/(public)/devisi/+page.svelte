<script lang="ts">
	let { data } = $props();

	const devisiList = $derived(data.devisiList || []);
</script>

<svelte:head>
	<title>Divisi - HIMATIF ITB Yadika</title>
	<meta name="description" content="Jelajahi berbagai divisi di dalam HIMATIF ITB Yadika dan lihat bagaimana setiap divisi berkontribusi terhadap misi dan visi organisasi." />
</svelte:head>

<section class="bg-gradient-surface stack section relative mt-3 min-w-full overflow-hidden px-3">
	<div class="bg-dot-pattern pointer-events-none absolute inset-0"></div>
	<div class="stack-lg relative z-10 container flex flex-col items-center gap-4">
		<div class="header flex flex-col items-center justify-center gap-3">
			<span class="badge-pill bg-secondary text-center text-slate-100 capitalize">
				struktur organisasi
			</span>
			<h1 class="head mb-3 text-4xl font-extrabold tracking-tight text-title-text">
				Devisi <span class="gradient-text">HIMATIF</span>
			</h1>
			<p class="max-w-4xl text-center text-lg/7 leading-relaxed opacity-80">
				Jelajahi berbagai divisi di dalam HIMATIF ITB Yadika dan lihat bagaimana setiap divisi
				berkontribusi terhadap misi dan visi organisasi.
			</p>
		</div>
	</div>
</section>

<section class="stack section mt-3 min-w-full bg-background px-3">
	<div class="container grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each devisiList as item, i (item.id)}
			<div
				class="card glass-card group hover-lift grid h-full grid-cols-1 justify-evenly gap-4 rounded-2xl px-4 py-6"
				style="box-shadow: var(--shadow-card-md);"
			>
				<div class="header stack-sm flex w-full flex-col items-start">
					<!-- Logo 32x32 -->
					<div class="icon-container flex h-12 w-12 items-center justify-center rounded">
						<img
							src={item.logoUrl}
							alt={item.nama}
							width="32"
							height="32"
							loading="lazy"
							decoding="async"
							class="h-8 w-8 object-contain"
						/>
					</div>
					<div class="title text-lg font-bold tracking-wide text-title-text">
						{item.nama}
					</div>
					<span class="font-semibold text-secondary">
						{item.namaLengkap}
					</span>
				</div>
				<div class="content flex w-full max-w-lg flex-col items-center gap-3">
					<p class="mb-3 w-full leading-relaxed opacity-85">
						{item.deskripsi}
					</p>
					<!-- Thumbnail 320x120 aspect ratio 8:3 -->
					<div
						class="relative w-full overflow-hidden rounded-xl pt-[37.5%]"
						style="box-shadow: var(--shadow-card);"
					>
						<img
							src={item.thumbnailUrl}
							alt={item.nama}
							width="320"
							height="120"
							loading="lazy"
							decoding="async"
							class="absolute inset-0 h-full w-full object-cover"
						/>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
