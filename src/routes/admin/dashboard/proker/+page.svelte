<script>
    import { Construction } from '@lucide/svelte';

    function goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "/";
        }
    }
</script>

<section class="min-h-[70vh] min-w-full bg-gradient-surface section px-3 mt-7 relative overflow-hidden flex flex-col justify-center items-center">
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
    
    <div class="glass-card rounded-2xl flex flex-col items-center text-center p-10 max-w-2xl relative z-10 hover-lift" style="box-shadow: var(--shadow-card-md);">
        <div class="bg-secondary/10 p-4 rounded-full mb-6">
            <Construction size={64} class="text-secondary" strokeWidth={1.5} />
        </div>
        
        <h1 class="text-title-text text-4xl font-extrabold tracking-tight mb-4">
            Masih <span class="gradient-text">Dalam Pengerjaan</span>
        </h1>
        
        <p class="leading-relaxed opacity-80 text-lg mb-8">
            Halaman detail program kerja ini sedang dalam tahap pengembangan. Silakan kembali lagi nanti untuk melihat informasi lengkapnya.
        </p>

        <p class="leading-relaxed opacity-80 text-sm mb-8">
            Tim kami sedang sibuk mohon tinggu sebentar. Terima kasih atas pengertiannya.
        </p>

        <button onclick={goBack} class="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ease-in-out duration-300 text-white hover:-translate-y-1" style="background: var(--color-secondary); box-shadow: var(--shadow-md);">
            &larr; Kembali 
        </button>
    </div>
</section>