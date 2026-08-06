<script lang="ts">
    let { data } = $props();

    const devisi = $derived(data.devisi);

    
</script>



<section class="min-w-full bg-gradient-surface stack section px-3 mt-3 relative overflow-hidden">
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
    <div class="flex flex-col container stack-lg gap-4 items-center relative z-10">
        <div class="header flex flex-col items-center gap-3 justify-center">
            <span class="badge-pill bg-secondary text-slate-100 capitalize text-center">
                struktur organisasi
            </span>
            <h1 class="head text-4xl font-extrabold text-title-text mb-3 tracking-tight">Devisi <span class="gradient-text">HIMATIF</span></h1>
            <p class="max-w-4xl text-center text-lg/7 leading-relaxed opacity-80">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sint, ullam eligendi! Aspernatur cupiditate dolor cumque vitae omnis deleniti illo numquam? Fugiat repellat accusamus assumenda repellendus quidem rem voluptatibus vel dolorum?</p>
        </div>
    </div>
</section>

<section class="min-w-full bg-background stack section px-3 mt-3 ">
    <div class="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each devisi as item, i (i)}
        <div class="card grid grid-cols-1 justify-evenly glass-card rounded-2xl px-4 py-6 gap-4 h-full group hover-lift" style="box-shadow: var(--shadow-card-md);">
            <div class="header flex flex-col items-start stack-sm">
                <div class="icon-container">
                    <img src="{item.logoUrl}" alt={item.nama}>
                </div>
                <div class="title text-title-text font-bold text-lg tracking-wide">
                    {item.nama}
                </div>
                <span class="text-secondary font-semibold">
                    {item.namaLengkap}
                </span>
            </div>
            <div class="content flex flex-col gap-3 items-center max-w-lg">
                <p class="leading-relaxed mb-3 opacity-85">
                    {item.deskripsi}
                </p>
                <img src="{item.thumbnailUrl}" alt={item.nama} class="rounded-xl" style="box-shadow: var(--shadow-card);">
            </div>
        </div>
    {/each}
    
    </div>
</section>