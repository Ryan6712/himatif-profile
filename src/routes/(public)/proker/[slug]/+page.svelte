<script lang="ts">
    import { parseMarkdown } from "$lib/utils/markdown";

    let { data } = $props();

    const proker = $derived(data.proker);
    const htmlContent = $derived(proker?.content ? parseMarkdown(proker.content) : "");

    function formatDate(date: string | Date | null) {
        if (!date) return "Tanggal tidak tersedia";
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
</script>

<svelte:head>
    <title>{proker?.title || 'Program Kerja'} - HIMATIF</title>
</svelte:head>

{#if proker}
<article class="container section stack-lg px-3 mt-7">
    <header class="stack-sm mb-8">
        <a href="/proker" class="text-sm opacity-60 inline-flex items-center gap-1 hover:text-secondary transition-colors">
            <span>&larr;</span> Kembali ke Program Kerja
        </a>
        <h1 class="text-4xl font-extrabold tracking-tight text-title-text mt-4">
            {proker.title}
        </h1>
        <time class="text-sm font-semibold text-secondary block mt-2">
            {formatDate(proker.date)}
        </time>
    </header>

    {#if proker.thumbnailUrl}
    <div class="mb-8 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-md aspect-video relative">
        <img src={proker.thumbnailUrl} alt={proker.title} class="absolute inset-0 w-full h-full object-cover" />
    </div>
    {/if}

    <div class="prose prose-lg max-w-none prose-img:rounded-xl">
        
        {@html htmlContent}
    </div>
</article>
{:else}
<div class="container section px-3 mt-10 text-center">
    <h1 class="text-2xl font-bold">Program kerja tidak ditemukan.</h1>
    <a href="/proker" class="text-secondary mt-4 inline-block">Kembali ke list program kerja</a>
</div>
{/if}