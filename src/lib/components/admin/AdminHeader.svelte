<script lang="ts">
    import { Menu } from "@lucide/svelte";
    import { page } from "$app/state";

    interface User {
        name: string; 
        email: string; 
        username?: string | null; 
    }

    let { toggleSidebar, user } = $props<{
        toggleSidebar: () => void;
        user: User; //pastikan ada interface jangan pakai any definisikan aja apa yang akan dipakai
    }>();

    // Map path to title
    const getPageTitle = (path: string) => {
        if (path.includes("organisasi")) return "Organisasi";
        if (path.includes("devisi")) return "Kelola Divisi";
        if (path.includes("member")) return "Kelola Anggota";
        if (path.includes("proker")) return "Program Kerja";
        return "Dashboard";
    };

    let pageTitle = $derived(getPageTitle(page.url.pathname));
</script>

<header class="h-16 border-b border-primary/10 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
    <div class="flex items-center gap-4">
        <!-- Mobile Menu Toggle -->
        <button 
            onclick={toggleSidebar}
            class="lg:hidden p-2 rounded bg-primary/10 text-secondary hover:bg-primary/20 smooth-transition"
        >
            <Menu class="w-6 h-6" />
        </button>

        <h2 class="text-2xl font-extrabold text-title-text tracking-tight">{pageTitle}</h2>
    </div>

    <div class="flex items-center gap-4 bg-surface px-4 py-1.5 rounded border border-primary/10 shadow-sm">
        <div class="hidden sm:flex flex-col items-end">
            <span class="text-sm font-bold text-title-text leading-tight">{user?.name || user?.username || 'Admin'}</span>
            <span class="text-xs opacity-70 text-primary-text">{user?.email}</span>
        </div>
        <!-- Note: user icon tetap bundar, sesuai instruksi, "kecuali button" dan biasanya icon profil wajar tetap bulat/full -->
        <div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-secondary font-extrabold border border-primary/30 shadow-inner">
            {(user?.name || user?.username || 'A')[0].toUpperCase()}
        </div>
    </div>
</header>