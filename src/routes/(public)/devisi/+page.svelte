<script lang="ts">
    let { data } = $props();

    const devisiList = $derived(data.devisiList || []);
</script>



<section class="min-w-full bg-gradient-surface stack section px-3 mt-3 relative overflow-hidden">
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
    <div class="flex flex-col container stack-lg gap-4 items-center relative z-10">
        <div class="header flex flex-col items-center gap-3 justify-center">
            <span class="badge-pill bg-secondary text-slate-100 capitalize text-center">
                struktur organisasi
            </span>
            <h1 class="head text-4xl font-extrabold text-title-text mb-3 tracking-tight">Devisi <span class="gradient-text">HIMATIF</span></h1>
            <p class="max-w-4xl text-center text-lg/7 leading-relaxed opacity-80">Jelajahi berbagai divisi di dalam HIMATIF ITB Yadika dan lihat bagaimana setiap divisi berkontribusi terhadap misi dan visi organisasi.</p>
        </div>
    </div>
</section>

<section class="min-w-full bg-background stack section px-3 mt-3 ">
    <div class="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each devisiList as item, i (item.id)}
        <div class="card grid grid-cols-1 justify-evenly glass-card rounded-2xl px-4 py-6 gap-4 h-full group hover-lift" style="box-shadow: var(--shadow-card-md);">
            <div class="header flex flex-col items-start stack-sm w-full">
                <!-- Logo 32x32 -->
                <div class="icon-container w-12 h-12 flex items-center justify-center rounded">
                    <img src="{item.logoUrl}" alt={item.nama} width="32" height="32" loading="lazy" decoding="async" class="w-8 h-8 object-contain">
                </div>
                <div class="title text-title-text font-bold text-lg tracking-wide">
                    {item.nama}
                </div>
                <span class="text-secondary font-semibold">
                    {item.namaLengkap}
                </span>
            </div>
            <div class="content flex flex-col gap-3 items-center max-w-lg w-full">
                <p class="leading-relaxed mb-3 opacity-85 w-full">
                    {item.deskripsi}
                </p>
                <!-- Thumbnail 320x120 aspect ratio 8:3 -->
                <div class="w-full relative pt-[37.5%] rounded-xl overflow-hidden" style="box-shadow: var(--shadow-card);">
                    <img src="{item.thumbnailUrl}" alt={item.nama} width="320" height="120" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover">
                </div>
            </div>
        </div>
    {/each}
    
    </div>
</section>