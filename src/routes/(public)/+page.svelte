<script lang="ts">
    import  { Rocket, Eye, Gem }  from "@lucide/svelte";
    
    let { data } = $props();
    
    // Fallback data if DB is empty
    const defaultOrg = {
        nama: "HIMATIF",
        namaLengkap: "Himpunan Mahasiswa Teknologi Informasi ITB Yadika",
        logoBigUrl: "https://placehold.co/500x400/png?text=himatif",
        visi: "Menjadi wadah yang mendorong kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa Teknologi Informasi untuk menjadi pemimpin masa depan di era digital.",
        misi: '["Menyelenggarakan kegiatan yang mendorong kolaborasi dan komunikasi antar mahasiswa Teknologi Informasi.", "Mengadakan kegiatan pembelajaran dan pelatihan untuk meningkatkan kemampuan dan keterampilan mahasiswa.", "Memberikan wadah bagi mahasiswa untuk mengeksplorasi minat dan bakat mereka dalam bidang teknologi informasi."]',
        tujuan: "Menjadi wadah yang mendorong kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa Teknologi Informasi untuk menjadi pemimpin masa depan di era digital."
    };

    const org = $derived(data.organization || defaultOrg)

    // Parse misi safely
    const misiList = $derived.by<string[]>(() => {
		if (!org.misi) return [];
		try {
			const parsed = JSON.parse(org.misi);
			return Array.isArray(parsed) ? parsed : [org.misi];
		} catch {
			return org.misi.split('\n').map(s => s.trim()).filter(Boolean);
		}
	});
</script>

<section class="min-w-full bg-gradient-surface stack section px-3 mt-3 relative overflow-hidden">
    <!-- Subtle dot pattern overlay -->
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
    <div class="flex flex-col md:flex-row container stack-lg lg:mt-0 gap-4 relative z-10">
        <div class="flex flex-col stack-lg md:gap-4 max-w-3xl p-3 ">
            <h1 class="capitalize text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                {org.namaLengkap}
            </h1>
            <p class="md:text-base leading-relaxed opacity-80">{org.nama} ITB Yadika. Wadah kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa IT.</p>
            <button class="btn-cta py-3 px-7 self-start text-base">
                <a href="mailto:himatif@stmik-yadika.ac.id">Hubungi Kami</a>
            </button>
        </div>
        <div class="self-center w-full max-w-125 shrink-0">
            <!-- 500x400 aspect ratio 5:4 -->
            <img src={org.logoBigUrl} alt={org.nama} class="rounded-2xl w-full aspect-5/4 object-cover skew-y-5 -skew-x-7 smooth-transition hover:skew-0" style="box-shadow: var(--shadow-card-xl);">
        </div>
    </div>
</section>

<!-- About Us -->
<section class="min-w-full bg-tertiary/20 stack section px-3 ">
    <div class="flex flex-col items-center gap-5">
        <div class="flex justify-center items-center">
            <span class="badge-pill bg-primary text-title-text">Tentang Kami</span>
        </div>
        <p class="max-w-3xl text-center leading-relaxed text-lg/7">
            {org.namaLengkap} adalah wadah bagi mahasiswa Teknologi Informasi untuk berkolaborasi, mengeksplorasi, dan mengembangkan diri dalam bidang teknologi informasi.
        </p>
    </div>
</section>

<!-- Visi, Misi, Tujuan -->
<section class="min-w-full bg-background stack section px-3">
    <div class="flex flex-col stack-lg container">
        <div class="flex justify-start items-center">
            <span class="badge-pill bg-primary text-title-text">Visi, Misi, Tujuan</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- 1 -->
            <div class="card grid grid-cols-1 justify-evenly glass-card rounded-2xl p-4 gap-4 h-full group hover-lift">
                <div class="header flex flex-row items-center gap-4">
                    <div class="icon-container">
                        <Eye />
                    </div>
                    <div class="title text-title-text font-bold text-lg tracking-wide">
                        Visi
                    </div>
                </div>
                <p class="leading-relaxed">
                    {org.visi}
                </p>
            </div>
            <!-- 2 -->
            <div class="card grid grid-cols-1 justify-evenly glass-card rounded-2xl p-4 gap-4 md:col-span-2 h-full group hover-lift">
                <div class="header flex flex-row items-center gap-4">
                    <div class="icon-container">
                        <Rocket />
                    </div>
                    <div class="title text-title-text font-bold text-lg tracking-wide">
                        Misi
                    </div>
                </div>
                <ul class="list-disc list-outside ps-5 space-y-2 leading-relaxed">
                    {#each misiList as misiItem (misiItem)}
                        <li>{misiItem}</li>
                    {/each}
                </ul>
            </div>
            <!-- 3 -->
            <div class="card flex flex-col justify-evenly glass-card rounded-2xl p-4 gap-4 md:col-span-3 h-full group hover-lift">
                <div class="header flex flex-row items-center gap-4">
                    <div class="icon-container">
                        <Gem />
                    </div>
                    <div class="title text-title-text font-bold text-lg tracking-wide">
                        Tujuan
                    </div>
                </div>
                <p class="leading-relaxed">
                    {org.tujuan}
                </p>
            </div>
        </div>
    </div>
</section>