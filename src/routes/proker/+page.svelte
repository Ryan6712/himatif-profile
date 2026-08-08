<script>
    let { data } = $props();

    const proker = $derived(data.proker);
    

</script>

<style>
    .read-more {
        position: relative;
        transition: color var(--duration-normal) var(--ease-out-expo);
    }
    .read-more::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 1.5px;
        background: var(--color-secondary);
        border-radius: 1px;
        transition: width var(--duration-normal) var(--ease-out-expo);
    }
    .read-more:hover::after {
        width: 70%;
    }
</style>

<section class="min-w-full bg-gradient-surface section px-3 mt-7 relative overflow-hidden">
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
    <div class="header flex flex-col justify-start items-start stack container mb-10 relative z-10">
        <h1 class="text-title-text text-5xl font-extrabold tracking-tight">
            Program <span class="gradient-text">Kerja</span>
        </h1>
        <h2 class="max-w-3xl leading-relaxed opacity-80 text-lg">
            Program kerja HIMATIF ITB Yadika adalah inisiatif yang dirancang untuk mendorong kolaborasi, inovasi, dan pengembangan diri mahasiswa Teknologi Informasi. Setiap program kerja dirancang untuk memberikan pengalaman berharga, memperluas wawasan, dan membangun keterampilan yang relevan dengan dunia teknologi informasi.
        </h2>
    </div>
    <div class="proker-wrapper gap-6 grid grid-cols-1 container mt-10 relative z-10">
    {#each proker as item, i (i)}
        <div class="proker px-4 py-6 glass-card rounded-2xl flex gap-4 flex-wrap justify-center items-start lg:justify-start group hover-lift" style="box-shadow: var(--shadow-card-md);">
            <img src={item.thumbnail} alt="" class="rounded-xl" style="box-shadow: var(--shadow-card);">
            <div class="desc flex flex-col">
                <span class="title font-extrabold text-2xl text-title-text tracking-tight">{item.title}</span>
                <span class="date text-secondary font-semibold text-sm mt-2">{item.date ? item.date : 'Tanggal tidak tersedia'}</span>
                <p class="max-w-2xl mt-5 leading-relaxed opacity-85">{item.description}</p>
                <a href="/proker/proker-detail" class="read-more mt-4 text-secondary font-semibold inline-flex items-center gap-1">baca selengkapnya <span class="group-hover:ms-3 transition-all ease-in-out duration-300">&rarr;</span></a>
            </div>
        </div>
    {/each}
    </div>
</section>
