<script lang="ts">
	import { Rocket, Eye, Gem, ArrowRight, Sparkles } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';

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

	let ready = $state(false);
	$effect(() => {
		ready = true;
	});
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
	class="bg-gradient-surface relative flex min-h-[90vh] min-w-full items-center overflow-hidden px-3 pt-24 pb-12"
>
	<!-- Decorative background elements -->
	<div class="bg-dot-pattern pointer-events-none absolute inset-0 opacity-40"></div>

	<!-- Glow effects -->
	<div
		class="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-[100px]"
	></div>
	<div
		class="pointer-events-none absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-tertiary/30 blur-[80px]"
	></div>

	<div class="relative z-10 container mx-auto">
		<div class="flex flex-col-reverse items-center justify-between gap-12 lg:flex-row">
			<!-- Text Content -->
			{#if ready}
				<div
					class="flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left"
					in:fly={{ y: 30, duration: 800, delay: 100 }}
				>
					<div
						class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-secondary backdrop-blur-sm"
					>
						<Sparkles size={16} class="text-primary" />
						<span>Selamat Datang di Portal Resmi</span>
					</div>

					<h1
						class="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-title-text md:text-5xl lg:text-6xl xl:text-7xl"
					>
						<span class="block">Bersama</span>
						<span class="gradient-text block pb-2">{org.nama}</span>
					</h1>

					<p class="mb-8 max-w-xl text-lg leading-relaxed text-primary-text/80 md:text-xl">
						Wadah kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa Teknologi Informasi
						ITB Yadika.
					</p>

					<div class="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
						<a
							href="mailto:himatif@stmik-yadika.ac.id"
							class="btn-cta group flex items-center gap-2 px-8 py-4 text-base font-bold"
						>
							Hubungi Kami
							<ArrowRight size={20} class="transition-transform group-hover:translate-x-1" />
						</a>
						<a
							href="#tentang"
							class="rounded-lg border-2 border-primary/20 bg-surface/50 px-8 py-4 text-base font-bold text-title-text backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/5"
						>
							Pelajari Lebih Lanjut
						</a>
					</div>
				</div>
			{/if}

			<!-- Image Content -->
			{#if ready}
				<div
					class="relative w-full max-w-lg shrink-0 lg:max-w-xl xl:max-w-2xl"
					in:fly={{ x: 30, duration: 800, delay: 300 }}
				>
					<!-- Decorative shapes behind image -->
					<div
						class="absolute -inset-4 rotate-3 transform rounded-3xl bg-linear-to-tr from-primary/20 to-tertiary/20 blur-2xl"
					></div>
					<div
						class="absolute -inset-1 rounded-2xl bg-linear-to-br from-primary/40 to-transparent"
					></div>

					<div
						class="glass relative overflow-hidden rounded-2xl border border-white/20 p-2 shadow-2xl"
					>
						<!-- 500x400 aspect ratio 5:4 -->
						<img
							src={org.logoBigUrl}
							alt={org.nama}
							width="800"
							height="640"
							fetchpriority="high"
							decoding="async"
							class="smooth-transition aspect-5/4 w-full rounded-xl object-cover hover:scale-[1.02]"
						/>
					</div>

					<!-- Floating badge -->
					<div
						class="glass-card animate-bounce-slow absolute -bottom-6 -left-6 hidden rounded-xl p-4 shadow-xl md:block"
						style="animation: float 6s ease-in-out infinite;"
					>
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-secondary"
							>
								<Rocket size={20} />
							</div>
							<div>
								<p class="text-xs font-bold tracking-wider text-title-text uppercase">Inovasi</p>
								<p class="text-sm text-primary-text/70">& Kolaborasi</p>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- About Us -->
<section id="tentang" class="section relative min-w-full bg-tertiary/10 px-3">
	<!-- Top curve divider -->
	<div
		class="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"
	></div>

	<div class="container mx-auto">
		<div class="flex flex-col items-center gap-8 text-center">
			<div class="inline-block">
				<span
					class="badge-pill border border-primary/30 bg-primary/20 text-secondary backdrop-blur-md"
					>Tentang Kami</span
				>
			</div>
			<h2 class="text-3xl font-bold text-title-text md:text-4xl">Mengenal Lebih Dekat</h2>
			<p class="max-w-3xl text-lg/8 leading-relaxed text-primary-text/80 md:text-xl/8">
				<strong class="text-secondary">{org.namaLengkap}</strong> adalah wadah bagi mahasiswa Teknologi
				Informasi untuk berkolaborasi, mengeksplorasi, dan mengembangkan diri dalam bidang teknologi informasi
				demi menciptakan generasi digital yang unggul.
			</p>
		</div>
	</div>
</section>

<!-- Visi, Misi, Tujuan -->
<section class="section relative min-w-full bg-background px-3">
	<!-- Decorative background -->
	<div
		class="pointer-events-none absolute top-1/4 right-0 h-64 w-64 rounded-full bg-tertiary/20 blur-[100px]"
	></div>

	<div class="container mx-auto">
		<div class="mb-12 flex flex-col items-center text-center">
			<span
				class="badge-pill mb-4 border border-primary/30 bg-primary/20 text-secondary backdrop-blur-md"
				>Arah Gerak</span
			>
			<h2 class="text-3xl font-bold text-title-text md:text-4xl">Visi, Misi & Tujuan</h2>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- 1: Visi -->
			<div class="card glass-card group hover-lift flex h-full flex-col gap-6 rounded-3xl p-8">
				<div class="flex items-center gap-4">
					<div class="icon-container flex h-14 w-14 shrink-0 items-center justify-center">
						<Eye size={28} class="text-secondary" />
					</div>
					<h3 class="text-2xl font-bold tracking-wide text-title-text">Visi</h3>
				</div>
				<p class="text-lg leading-relaxed text-primary-text/80">
					{org.visi}
				</p>
			</div>

			<!-- 2: Misi -->
			<div
				class="card glass-card group hover-lift flex h-full flex-col gap-6 rounded-3xl p-8 lg:col-span-2"
			>
				<div class="flex items-center gap-4">
					<div class="icon-container flex h-14 w-14 shrink-0 items-center justify-center">
						<Rocket size={28} class="text-secondary" />
					</div>
					<h3 class="text-2xl font-bold tracking-wide text-title-text">Misi</h3>
				</div>
				<ul class="flex flex-col gap-4">
					{#each misiList as misiItem, i (i)}
						<li class="flex items-start gap-4">
							<div
								class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-secondary"
							>
								{i + 1}
							</div>
							<span class="text-lg leading-relaxed text-primary-text/80">{misiItem}</span>
						</li>
					{/each}
				</ul>
			</div>

			<!-- 3: Tujuan -->
			<div
				class="card glass-card group hover-lift relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl p-8 lg:col-span-3"
			>
				<!-- Background decoration for the wide card -->
				<div
					class="pointer-events-none absolute -top-20 -right-20 opacity-5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12"
				>
					<Gem size={300} />
				</div>

				<div
					class="relative z-10 flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left"
				>
					<div
						class="icon-container flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl"
					>
						<Gem size={40} class="text-secondary" />
					</div>
					<div>
						<h3 class="mb-4 text-2xl font-bold tracking-wide text-title-text">Tujuan</h3>
						<p class="max-w-4xl text-lg leading-relaxed text-primary-text/80">
							{org.tujuan}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes float {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
		100% {
			transform: translateY(0px);
		}
	}
</style>
