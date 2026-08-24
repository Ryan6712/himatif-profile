<script lang="ts">
	import "./layout.css";
    import { navigating } from "$app/state";
    import { fade } from "svelte/transition";
    // Jika ada global CSS yang harus diload duluan, panggil di sini
    // (saat ini sudah diload dari layout.css di masing-masing sub-folder, jadi biarkan kosong jika dirasa aman)

    let { children } = $props();

    // Animasi progress bar simple berbasis CSS (tidak perlu external library)
</script>

<!-- Global Top Progress Bar -->
{#if navigating}
    <div 
        class="fixed top-0 left-0 w-full h-1 z-9999 bg-primary/20"
        transition:fade={{ duration: 150 }}
    >
        <div class="h-full bg-primary/90 animate-progress"></div>
    </div>
{/if}

<!-- Render konten asli halaman/sub-layout -->
{@render children()}

<style>
    @keyframes progress {
        0% { width: 0%; opacity: 1; }
        50% { width: 70%; opacity: 1; }
        100% { width: 100%; opacity: 0; }
    }
    
    .animate-progress {
        animation: progress 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        /* Tambahkan efek bayangan halus di bawahnya untuk memberi kesan menyala */
        box-shadow: 0 0 10px var(--color-primary), 0 0 5px var(--color-primary);
    }
</style>