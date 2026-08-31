<script lang="ts">
	import {
		Rocket,
		Eye,
		Gem,
		Users,
		Layers,
		Calendar,
		ArrowRight,
		ChevronRight,
		GitBranch,
		Cpu,
		UserCheck
	} from '@lucide/svelte';

	let { data } = $props();

	// Fallback data if DB is empty
	const defaultOrg = {
		nama: 'HIMATIF',
		namaLengkap: 'Himpunan Mahasiswa Teknologi Informasi ITB Yadika',
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
	class="relative my-auto flex min-w-full items-center overflow-hidden px-4 py-12 md:py-20 lg:py-24"
>
	<!-- Background Video -->
	<div class="pointer-events-none absolute inset-0 -z-10 w-full overflow-hidden">
		<video
			autoplay
			loop
			muted
			playsinline
			preload="metadata"
			poster="/himatif-frame01.jpg"
			class="h-full w-full object-cover object-[90%_0%] transition-opacity duration-1000 md:object-right"
		>
			<source src="/himatif.webm" type="video/webm" />
			<source src="/himatif.mp4" type="video/mp4" />
			Browser Anda tidak mendukung tag video HTML5.
		</video>

		<!-- Overlay Gradient -->
		<div
			class="md:bg-linear -to-r absolute inset-0 bg-linear-to-b from-[#f2f6f1]/90 via-[#f2f6f1]/75 to-[#f2f6f1]/40 md:from-[#f2f6f1]/95 md:via-[#f2f6f1]/60 md:to-transparent"
		></div>
	</div>

	<div class="mx-auto w-full max-w-7xl sm:px-4 lg:px-8">
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
			<!-- Kolom Teks / Konten Kiri -->
			<div class="space-y-6 lg:col-span-7 xl:col-span-6">
				<!-- Badge Official Website -->
				<div
					class="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/70 px-3.5 py-1.5 text-xs font-bold tracking-wider text-[#1b3b2b] uppercase shadow-xs backdrop-blur-md"
				>
					<GitBranch class="h-3.5 w-3.5 text-emerald-600" />
					<span>OFFICIAL WEBSITE</span>
				</div>

				<!-- Judul Utama (Hero Heading) -->
				<h1
					class="text-4xl leading-[1.12] font-extrabold tracking-tight text-[#1b3b2b] sm:text-5xl lg:text-[3.4rem]"
				>
					Himpunan Mahasiswa <br class="hidden sm:inline" />
					Teknologi Informasi <br class="hidden sm:inline" />
					<span class="text-[#1b3b2b]">ITB Yadika Pasuruan</span>
				</h1>

				<!-- Deskripsi / Tagline -->
				<p class="max-w-xl text-base leading-relaxed font-medium text-slate-600 sm:text-lg">
					<strong class="font-semibold text-[#1b3b2b]">{org.nama} ITB Yadika.</strong> Wadah kolaborasi,
					eksplorasi, dan potensi mahasiswa Teknologi Informasi untuk siap bersaing di era transformasi
					digital.
				</p>

				<!-- Grup Tombol CTA -->
				<div class="flex flex-wrap items-center gap-4 pt-3">
					<a
						href="mailto:himatif@stmik-yadika.ac.id"
						class="inline-flex items-center gap-2 rounded-full bg-[#1b3b2b] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1b3b2b]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#166534] hover:shadow-xl hover:shadow-[#1b3b2b]/30 sm:text-base"
					>
						<span>Hubungi Kami</span>
						<ArrowRight class="h-4 w-4" />
					</a>

					<a
						href="/proker"
						class="inline-flex items-center justify-center rounded-full border border-white/90 bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#1b3b2b] shadow-xs backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/95 sm:text-base"
					>
						<span>Program Kerja</span>
					</a>
				</div>

				<!-- Indikator Fitur Tambahan -->
				<div
					class="flex items-center gap-8 pt-6 text-xs font-semibold tracking-wider text-slate-500 uppercase"
				>
					<div class="flex items-center gap-2">
						<Cpu class="h-4 w-4 text-emerald-700" />
						<span>Inovatif & Kritis</span>
					</div>
					<div class="flex items-center gap-2">
						<UserCheck class="h-4 w-4 text-emerald-700" />
						<span>Kolaboratif</span>
					</div>
				</div>
			</div>

			<!-- Kolom Kanan transparan untuk melihat video background -->
			<div class="hidden min-h-[350px] lg:col-span-5 lg:block xl:col-span-6"></div>
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
