<script lang="ts">
    let { data } = $props();

    const devisi = data.devisi;

    
</script>



<section class="min-w-full bg-background stack section px-3 mt-3 ">
    <div class="flex flex-col container stack-lg gap-4 items-center">
        <div class="header flex flex-col items-center gap-2 justify-center">
            <span class="label bg-secondary rounded-full py-2 px-5 text-slate-100 font-bold shadow-md capitalize text-center">
                struktur organisasi
            </span>
            <h1 class="head text-4xl font-bold text-title-text mb-3">Devisi HIMATIF</h1>
            <p class="max-w-4xl text-center text-lg/7">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sint, ullam eligendi! Aspernatur cupiditate dolor cumque vitae omnis deleniti illo numquam? Fugiat repellat accusamus assumenda repellendus quidem rem voluptatibus vel dolorum?</p>
        </div>
    </div>
</section>

<section class="min-w-full bg-background stack section px-3 mt-3 ">
    <div class="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each devisi as item, i (i)}
        <div class="card grid grid-cols-1 justify-evenly bg-primary/30 border border-slate-800/10 rounded-2xl px-3 py-6 gap-4 h-full group group-hover:shadow-lg shadow-md shadow-slate-800/10">
            <div class="header flex flex-col items-start stack-sm">
                <div class="logo border border-primary shadow-sm group-hover:shadow-md p-2 rounded-2xl ">
                    <img src="{item.logoUrl}" alt={item.nama}>
                </div>
                <div class="title text-title-text font-bold">
                    {item.nama}
                </div>
                <span class="text-secondary font-semibold">
                    {item.namaLengkap}
                </span>
            </div>
            <div class="content flex flex-col gap-2 items-center max-w-lg">
                <p class="leading-relaxed mb-5">
                    {item.deskripsi}
                </p>
                <img src="{item.thumbnailUrl}" alt={item.nama}>
            </div>
        </div>
    {/each}
    
    </div>
</section>