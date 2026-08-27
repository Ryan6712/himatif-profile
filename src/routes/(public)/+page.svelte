<script lang="ts">
	import { Rocket, Eye, Gem } from '@lucide/svelte';

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
</script>

<svelte:head>
	<title>HIMATIF - Himpunan Mahasiswa Teknologi Informasi ITB Yadika</title>
	<meta
		name="description"
		content="HIMATIF ITB Yadika adalah wadah bagi mahasiswa Teknologi Informasi untuk berkolaborasi, mengeksplorasi, dan mengembangkan diri dalam bidang teknologi informasi."
	/>
</svelte:head>

<section class="bg-gradient-surface stack section relative mt-3 min-w-full overflow-hidden px-3">
	<!-- Subtle dot pattern overlay -->
	<div class="bg-dot-pattern pointer-events-none absolute inset-0"></div>
	<div class="stack-lg relative z-10 container flex flex-col gap-4 md:flex-row lg:mt-0">
		<div class="stack-lg flex max-w-3xl flex-col p-3 md:gap-4">
			<h1 class="text-3xl leading-tight font-extrabold tracking-tight capitalize md:text-4xl">
				{org.namaLengkap}
			</h1>
			<p class="leading-relaxed opacity-80 md:text-base">
				{org.nama} ITB Yadika. Wadah kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa IT.
			</p>
			<button class="btn-cta self-start px-7 py-3 text-base">
				<a href="mailto:himatif@stmik-yadika.ac.id">Hubungi Kami</a>
			</button>
		</div>
		<div class="w-full max-w-125 shrink-0 self-center">
			<!-- 500x400 aspect ratio 5:4 -->
			<img
				src={org.logoBigUrl}
				alt={org.nama}
				width="500"
				height="400"
				fetchpriority="high"
				decoding="async"
				class="smooth-transition aspect-5/4 w-full -skew-x-7 skew-y-5 rounded-2xl object-cover hover:skew-0"
				style="box-shadow: var(--shadow-card-xl);"
			/>
		</div>
	</div>
</section>

<!-- About Us -->
<section class="stack section min-w-full bg-tertiary/20 px-3">
	<div class="flex flex-col items-center gap-5">
		<div class="flex items-center justify-center">
			<span class="badge-pill bg-primary text-title-text">Tentang Kami</span>
		</div>
		<p class="max-w-3xl text-center text-lg/7 leading-relaxed">
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
			<!-- 1 -->
			<div
				class="card glass-card group hover-lift grid h-full grid-cols-1 justify-evenly gap-4 rounded-2xl p-4"
			>
				<div class="header flex flex-row items-center gap-4">
					<div class="icon-container">
						<Eye />
					</div>
					<div class="title text-lg font-bold tracking-wide text-title-text">Visi</div>
				</div>
				<p class="leading-relaxed">
					{org.visi}
				</p>
			</div>
			<!-- 2 -->
			<div
				class="card glass-card group hover-lift grid h-full grid-cols-1 justify-evenly gap-4 rounded-2xl p-4 md:col-span-2"
			>
				<div class="header flex flex-row items-center gap-4">
					<div class="icon-container">
						<Rocket />
					</div>
					<div class="title text-lg font-bold tracking-wide text-title-text">Misi</div>
				</div>
				<ul class="list-outside list-disc space-y-2 ps-5 leading-relaxed">
					{#each misiList as misiItem (misiItem)}
						<li>{misiItem}</li>
					{/each}
				</ul>
			</div>
			<!-- 3 -->
			<div
				class="card glass-card group hover-lift flex h-full flex-col justify-evenly gap-4 rounded-2xl p-4 md:col-span-3"
			>
				<div class="header flex flex-row items-center gap-4">
					<div class="icon-container">
						<Gem />
					</div>
					<div class="title text-lg font-bold tracking-wide text-title-text">Tujuan</div>
				</div>
				<p class="leading-relaxed">
					{org.tujuan}
				</p>
			</div>
		</div>
	</div>
</section>
