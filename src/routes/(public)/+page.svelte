<script lang="ts">
	import {
		Rocket,
		Eye,
		Gem,
		Users,
		Layers,
		Calendar,
		ArrowRight,
		Sparkles,
		ChevronRight
	} from '@lucide/svelte';

	let { data } = $props();

	// Fallback data if DB is empty
	const defaultOrg = {
		nama: 'HIMATIF',
		namaLengkap: 'Himpunan Mahasiswa Teknologi Informasi ITB Yadika',
		logoBigUrl: 'https://placehold.co/500x400/png?text=himatif',
		visi: 'Menjadi wadah yang mendorong kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa Teknologi Informasi untuk menjadi pemimpin masa depan di era digital.',
		misi: '["Menyelenggarakan kegiatan yang mendorong kolaborasi dan komunikasi antar mahasiswa Teknologi Informasi.", "Mengadakan kegiatan pembelajaran dan pelatihan untuk meningkatkan kemampuan dan keterampilan mahasiswa.", "Memberikan wadah bagi mahasiswa untuk mengeksplorasi minat dan bakat mereka dalam bidang teknologi informasi."]',
		tujuan:
			'Menjadi wadah yang mendorong kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa Teknologi Informasi untuk menjadi pemimpin masa depan di era digital.'
	};

	const org = $derived(data.organization || defaultOrg);
	const stats = $derived(data.stats || { members: 0, devisi: 0, proker: 0 });
	const latestProkers = $derived(data.latestProkers || []);
	const devisiList = $derived(data.devisiList || []);

	// Parse misi safely
	const misiList = $derived.by<string[]>(() => {
		if (!org.misi) return [];
		try {
			const parsed = JSON.parse(org.misi);
			return Array.isArray(parsed) ? parsed : [org.misi];
		} catch {
			return org.misi
				.split('\n')
				.map((s) => s.trim())
				.filter(Boolean);
		}
	});

	function formatDate(dateString: Date | string) {
		const d = new Date(dateString);
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>HIMATIF - Himpunan Mahasiswa Teknologi Informasi ITB Yadika</title>
	<meta
		name="description"
		content="HIMATIF ITB Yadika adalah wadah bagi mahasiswa Teknologi Informasi untuk berkolaborasi, mengeksplorasi, dan mengembangkan diri dalam bidang teknologi informasi."
	/>
</svelte:head>

<!-- Hero Section -->
<section
	class="bg-gradient-surface stack section relative mt-3 min-w-full overflow-hidden px-3 pt-12 md:pt-16"
>
	<!-- Subtle dot pattern overlay -->
	<div class="bg-dot-pattern pointer-events-none absolute inset-0"></div>

	<div class="stack-lg relative z-10 container flex flex-col gap-8 md:flex-row md:items-center">
		<div class="stack-lg flex max-w-3xl flex-col p-3 md:gap-6">
			<div
				class="inline-flex items-center gap-2 self-start rounded-full border border-tertiary/40 bg-surface/80 px-4 py-1.5 backdrop-blur-md"
			>
				<Sparkles class="h-4 w-4 text-secondary" />
				<span class="text-xs font-semibold tracking-wide text-primary-text uppercase"
					>Official Website</span
				>
			</div>

			<h1
				class="text-3xl leading-tight font-extrabold tracking-tight capitalize md:text-5xl lg:leading-tight"
			>
				{org.namaLengkap}
			</h1>

			<p class="text-base leading-relaxed opacity-85 md:text-lg">
				{org.nama} ITB Yadika. Wadah kolaborasi, eksplorasi, dan pengembangan potensi mahasiswa Teknologi
				Informasi untuk siap bersaing di era transformasi digital.
			</p>

			<div class="flex flex-wrap items-center gap-4 pt-2">
				<button class="btn-cta self-start px-7 py-3 text-base">
					<a href="mailto:himatif@stmik-yadika.ac.id" class="flex items-center gap-2">
						Hubungi Kami
						<ArrowRight class="h-4 w-4" />
					</a>
				</button>

				<a
					href="/proker"
					class="smooth-transition flex items-center gap-2 rounded-lg border border-secondary/30 bg-surface/60 px-6 py-3 font-semibold text-primary-text hover:border-secondary hover:bg-surface/90"
				>
					Program Kerja
				</a>
			</div>
		</div>

		<div class="relative w-full max-w-125 shrink-0 self-center">
			<div
				class="absolute -inset-1 rounded-3xl bg-linear-to-r from-primary/30 to-secondary/30 opacity-70 blur-xl"
			></div>
			<!-- 500x400 aspect ratio 5:4 -->
			<img
				src={org.logoBigUrl}
				alt={org.nama}
				width="500"
				height="400"
				fetchpriority="high"
				decoding="async"
				class="smooth-transition relative aspect-5/4 w-full rounded-2xl object-cover hover:scale-[1.01]"
				style="box-shadow: var(--shadow-card-xl);"
			/>
		</div>
	</div>
</section>

<!-- Stats Bar Section -->
<section class="section min-w-full bg-surface/40 px-3 py-8">
	<div class="container">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div class="glass-card hover-lift flex items-center gap-4 rounded-2xl p-5">
				<div class="icon-container shrink-0">
					<Users class="h-6 w-6 text-secondary" />
				</div>
				<div>
					<div class="text-2xl font-extrabold text-title-text">{stats.members}+</div>
					<div class="text-xs font-medium opacity-75">Anggota Aktif</div>
				</div>
			</div>

			<div class="glass-card hover-lift flex items-center gap-4 rounded-2xl p-5">
				<div class="icon-container shrink-0">
					<Layers class="h-6 w-6 text-secondary" />
				</div>
				<div>
					<div class="text-2xl font-extrabold text-title-text">{stats.devisi}</div>
					<div class="text-xs font-medium opacity-75">Devisi Spesialisasi</div>
				</div>
			</div>

			<div class="glass-card hover-lift flex items-center gap-4 rounded-2xl p-5">
				<div class="icon-container shrink-0">
					<Calendar class="h-6 w-6 text-secondary" />
				</div>
				<div>
					<div class="text-2xl font-extrabold text-title-text">{stats.proker}+</div>
					<div class="text-xs font-medium opacity-75">Program Kerja</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- About Us -->
<section class="stack section min-w-full bg-tertiary/20 px-3">
	<div class="flex flex-col items-center gap-5">
		<div class="flex items-center justify-center">
			<span class="badge-pill bg-primary text-title-text">Tentang Kami</span>
		</div>
		<p class="max-w-3xl text-center text-lg/7 leading-relaxed font-medium">
			{org.namaLengkap} adalah wadah bagi mahasiswa Teknologi Informasi untuk berkolaborasi, mengeksplorasi,
			dan mengembangkan diri dalam bidang teknologi informasi.
		</p>
	</div>
</section>

<!-- Visi, Misi, Tujuan -->
<section class="stack section min-w-full bg-background px-3">
	<div class="stack-lg container flex flex-col">
		<div class="flex items-center justify-start">
			<span class="badge-pill bg-primary text-title-text">Visi, Misi, Tujuan</span>
		</div>
		<div class="grid grid-cols-1 gap-5 md:grid-cols-3">
			<!-- 1: Visi -->
			<div
				class="card glass-card group hover-lift grid h-full grid-cols-1 justify-evenly gap-4 rounded-2xl p-5"
			>
				<div class="header flex flex-row items-center gap-4">
					<div class="icon-container">
						<Eye class="text-secondary" />
					</div>
					<div class="title text-lg font-bold tracking-wide text-title-text">Visi</div>
				</div>
				<p class="leading-relaxed opacity-90">
					{org.visi}
				</p>
			</div>
			<!-- 2: Misi -->
			<div
				class="card glass-card group hover-lift flex h-full flex-col justify-between gap-4 rounded-2xl p-5 md:col-span-2"
			>
				<div class="header flex flex-row items-center gap-4">
					<div class="icon-container">
						<Rocket class="text-secondary" />
					</div>
					<div class="title text-lg font-bold tracking-wide text-title-text">Misi</div>
				</div>
				<div class="space-y-3">
					{#each misiList as misiItem, index (misiItem)}
						<div class="flex items-start gap-3">
							<span
								class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/30 text-xs font-bold text-title-text"
							>
								{index + 1}
							</span>
							<p class="text-sm leading-relaxed opacity-90 md:text-base">{misiItem}</p>
						</div>
					{/each}
				</div>
			</div>
			<!-- 3: Tujuan -->
			<div
				class="card glass-card group hover-lift flex h-full flex-col justify-evenly gap-4 rounded-2xl p-5 md:col-span-3"
			>
				<div class="header flex flex-row items-center gap-4">
					<div class="icon-container">
						<Gem class="text-secondary" />
					</div>
					<div class="title text-lg font-bold tracking-wide text-title-text">Tujuan</div>
				</div>
				<p class="leading-relaxed opacity-90">
					{org.tujuan}
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Devisi Glance Section -->
{#if devisiList.length > 0}
	<section class="stack section min-w-full bg-surface/30 px-3">
		<div class="stack-lg container flex flex-col gap-6">
			<div class="flex items-center justify-between">
				<span class="badge-pill bg-primary text-title-text">Devisi Organisasi</span>
				<a
					href="/devisi"
					class="smooth-transition inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
				>
					Lihat Semua
					<ChevronRight class="h-4 w-4" />
				</a>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each devisiList as dev (dev.id)}
					<a
						href="/devisi"
						class="glass-card hover-lift flex items-center gap-4 rounded-2xl p-4 transition-all"
					>
						<img
							src={dev.logoUrl}
							alt={dev.nama}
							class="h-12 w-12 rounded-xl bg-tertiary/20 object-cover p-1"
						/>
						<div>
							<h3 class="font-bold text-title-text capitalize">{dev.nama}</h3>
							<p class="text-xs text-primary-text opacity-80">{dev.namaLengkap}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Latest Proker Showcase -->
{#if latestProkers.length > 0}
	<section class="stack section min-w-full bg-background px-3">
		<div class="stack-lg container flex flex-col gap-6">
			<div class="flex items-center justify-between">
				<span class="badge-pill bg-primary text-title-text">Program Kerja Terbaru</span>
				<a
					href="/proker"
					class="smooth-transition inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
				>
					Semua Proker
					<ChevronRight class="h-4 w-4" />
				</a>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each latestProkers as proker (proker.id)}
					<div class="glass-card hover-lift flex flex-col overflow-hidden rounded-2xl">
						{#if proker.thumbnailUrl}
							<img src={proker.thumbnailUrl} alt={proker.title} class="h-48 w-full object-cover" />
						{:else}
							<div
								class="flex h-48 w-full items-center justify-center bg-tertiary/20 text-secondary"
							>
								<Calendar class="h-10 w-10 opacity-50" />
							</div>
						{/if}
						<div class="flex flex-1 flex-col p-5">
							<span class="text-xs font-semibold text-secondary">
								{proker.publishedAt ? formatDate(proker.date) : 'Upcoming'}
							</span>
							<h3 class="mt-2 line-clamp-1 text-lg font-bold text-title-text">{proker.title}</h3>
							<p class="mt-2 line-clamp-3 text-xs leading-relaxed text-primary-text opacity-80">
								{proker.description}
							</p>
							<div class="mt-auto pt-4">
								<a
									href={`/proker/${proker.slug}`}
									class="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
								>
									Baca Selengkapnya
									<ChevronRight class="h-3 w-3" />
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- CTA Section -->
<section class="stack section bg-gradient-surface min-w-full px-3">
	<div class="container">
		<div
			class="glass-card hover-lift flex flex-col items-center justify-between gap-6 rounded-3xl p-8 text-center md:flex-row md:text-left"
		>
			<div class="max-w-2xl">
				<h2 class="text-2xl font-extrabold text-title-text md:text-3xl">
					Ingin Berkolaborasi Bersama HIMATIF?
				</h2>
				<p class="mt-2 text-sm text-primary-text opacity-85 md:text-base">
					Kami selalu terbuka untuk ide, kemitraan, dan kegiatan bersama untuk memajukan potensi
					mahasiswa ITB Yadika.
				</p>
			</div>
			<button class="btn-cta shrink-0 px-8 py-3.5 text-base">
				<a href="mailto:himatif@stmik-yadika.ac.id">Hubungi Kami</a>
			</button>
		</div>
	</div>
</section>
