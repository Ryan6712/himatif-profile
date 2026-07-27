<script>
    let { data } = $props();

    const proker = data.proker;
    

</script>



<section class="min-w-full bg-background section px-3 mt-7">
    <div class="header flex flex-col justify-start items-start stack container mb-10">
        <h1 class="text-title-text text-5xl font-bold">
            Program Kerja
        </h1>
        <h2 class="max-w-3xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus excepturi sunt architecto nisi ea placeat beatae nostrum perspiciatis numquam magnam. Voluptatem quisquam maiores consectetur eius neque cumque. Aspernatur, voluptatem ipsum?
        </h2>
    </div>
    <div class="proker-wrapper gap-6 grid grid-cols-1 container mt-10">
    {#each proker as item}
        <div class="proker px-3 py-5 bg-surface border border-primary shadow-xl rounded-2xl flex gap-3 flex-wrap justify-center items-start lg:justify-start group">
            <img src={item.thumbnail} alt="">
            <div class="desc flex flex-col">
                <span class="title font-bold text-2xl">{item.title}</span>
                <p class="max-w-2xl mt-6">{item.description}</p>
                <a href="/" class="mt-3 text-secondary">baca selengkapnya <span class="group-hover:ms-3 transition-all ease-in-out duration-200">&rarr;</span></a>
            </div>
        </div>
    {/each}
    </div>
</section>

