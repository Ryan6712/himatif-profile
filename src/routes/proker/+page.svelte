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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus excepturi sunt architecto nisi ea placeat beatae nostrum perspiciatis numquam magnam. Voluptatem quisquam maiores consectetur eius neque cumque. Aspernatur, voluptatem ipsum?
        </h2>
    </div>
    <div class="proker-wrapper gap-6 grid grid-cols-1 container mt-10 relative z-10">
    {#each proker as item}
        <div class="proker px-4 py-6 glass-card rounded-2xl flex gap-4 flex-wrap justify-center items-start lg:justify-start group hover-lift" style="box-shadow: var(--shadow-card-md);">
            <img src={item.thumbnail} alt="" class="rounded-xl" style="box-shadow: var(--shadow-card);">
            <div class="desc flex flex-col">
                <span class="title font-extrabold text-2xl text-title-text tracking-tight">{item.title}</span>
                <p class="max-w-2xl mt-5 leading-relaxed opacity-85">{item.description}</p>
                <a href="/" class="read-more mt-4 text-secondary font-semibold inline-flex items-center gap-1">baca selengkapnya <span class="group-hover:ms-3 transition-all ease-in-out duration-300">&rarr;</span></a>
            </div>
        </div>
    {/each}
    </div>
</section>
