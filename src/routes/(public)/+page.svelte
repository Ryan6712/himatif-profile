<script>
    import  { Rocket, Eye, Gem }  from "@lucide/svelte";
</script>

<section class="min-w-full bg-gradient-surface stack section px-3 mt-3 relative overflow-hidden">
    <!-- Subtle dot pattern overlay -->
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
    <div class="flex flex-col md:flex-row container stack-lg lg:mt-0 gap-4 relative z-10">
        <div class="flex flex-col stack-lg md:gap-4 max-w-3xl p-3 ">
            <h1 class="capitalize text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                Himpunan Mahasiswa <span class="gradient-text">Tekonologi Informasi</span>
                <br> ITB YADIKA Bangil
            </h1>
            <p class="md:text-base leading-relaxed opacity-80">Himpunan Mahasiswa Teknologi Informasi ITB Yadika. Wadah kolaborasi,
eksplorasi, dan pengembangan diri bagi mahasiswa IT.</p>
            <button class="btn-cta py-3 px-7 self-start text-base">
                <a href="mailto:himatif@stmik-yadika.ac.id">Hubungi Kami</a>
            </button>
        </div>
        <div class="self-center">
            <img src="https://placehold.co/500x400/png?text=himatif" alt="" class="rounded-2xl" style="box-shadow: var(--shadow-card-xl);">
        </div>
    </div>
</section>

<!-- About Us -->
<section class="min-w-full bg-tertiary/20 stack section px-3 ">
    <div class="flex flex-col items-center gap-5">
        <div class="flex justify-center items-center">
            <span class="badge-pill bg-primary text-title-text">Tentang Kami</span>
        </div>
        <p
        class="max-w-3xl text-center leading-relaxed text-lg/7"
        >Himpunan Mahasiswa Teknologi Informasi ITB Yadika adalah wadah bagi mahasiswa Teknologi Informasi untuk berkolaborasi, mengeksplorasi, dan mengembangkan diri dalam bidang teknologi informasi.</p>
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
                    Menjadi wadah yang mendorong kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa Teknologi Informasi untuk menjadi pemimpin masa depan di era digital.
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
                    <li>Menyelenggarakan kegiatan yang mendorong kolaborasi dan komunikasi antar mahasiswa Teknologi Informasi.</li>
                    <li>Mengadakan kegiatan pembelajaran dan pelatihan untuk meningkatkan kemampuan dan keterampilan mahasiswa.</li>
                    <li>Memberikan wadah bagi mahasiswa untuk mengeksplorasi minat dan bakat mereka dalam bidang teknologi informasi.</li>
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
                    Menjadi wadah yang mendorong kolaborasi, eksplorasi, dan pengembangan diri bagi mahasiswa Teknologi Informasi untuk menjadi pemimpin masa depan di era digital.
                </p>
            </div>
        </div>
    </div>
</section>
