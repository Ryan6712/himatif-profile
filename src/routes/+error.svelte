<script lang="ts">
    import { page } from "$app/state";
    import { AlertTriangle, ShieldAlert, FileQuestion } from "@lucide/svelte";

    // $page.error dari state akan menangkap pesan error dan status code
    let errorStatus = $derived(page.status);
    let errorMessage = $derived(page.error?.message || "Terjadi kesalahan yang tidak terduga.");

    // Menentukan Icon dan Tema Berdasarkan Status Error
    let detail = $derived.by(() => {
        if (errorStatus === 404) {
            return {
                title: "Halaman Tidak Ditemukan",
                Icon: FileQuestion,
                colorClass: "text-amber-500",
                bgClass: "bg-amber-500/10",
                borderClass: "border-amber-500/20"
            };
        } else if (errorStatus === 401 || errorStatus === 403) {
            return {
                title: "Akses Ditolak",
                Icon: ShieldAlert,
                colorClass: "text-red-500",
                bgClass: "bg-red-500/10",
                borderClass: "border-red-500/20"
            };
        } else {
            return {
                title: "Internal Server Error",
                Icon: AlertTriangle,
                colorClass: "text-red-500",
                bgClass: "bg-red-500/10",
                borderClass: "border-red-500/20"
            };
        }
    });

    // Helper navigasi kembali
    function goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "/";
        }
    }
</script>

<div class="min-h-screen w-full flex items-center justify-center bg-gradient-surface relative overflow-hidden px-4">
    <!-- Subtle dot pattern overlay -->
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none opacity-40"></div>
    
    <div class="glass-card rounded-2xl p-8 md:p-12 w-full max-w-lg relative z-10 flex flex-col items-center gap-6 text-center shadow-xl border border-primary/20">
        

        <!-- Icon Circle -->
        <div class="w-24 h-24 rounded-full {detail.bgClass} {detail.colorClass} border {detail.borderClass} flex items-center justify-center shrink-0 mb-2">
            <detail.Icon class="w-12 h-12" />
        </div>

        <div class="flex flex-col gap-2">
            <h1 class="text-7xl font-extrabold tracking-tight text-title-text mb-2 drop-shadow-sm">
                {errorStatus}
            </h1>
            <h2 class="text-2xl font-bold {detail.colorClass}">
                {detail.title}
            </h2>
            <p class="text-base opacity-80 text-primary-text leading-relaxed mt-2 max-w-sm mx-auto">
                {errorMessage}
            </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto justify-center items-center">
            <button 
                onclick={goBack} 
                class="px-6 py-3 rounded-full font-bold text-primary-text bg-white/50 hover:bg-white/80 border border-primary/10 smooth-transition"
            >
                Kembali
            </button>
            <a 
                href="/" 
                class="btn-cta py-3 px-8 text-base flex items-center justify-center gap-2 rounded-full"
            >
                Ke Beranda
            </a>
        </div>
    </div>
</div>