<script lang="ts">
    import { page } from "$app/state"; //pastikan pakai app/state karena store sudah kadaluarsa dan hapus $ pada varibale page yang dipanggil kalau pakai $app/state gk butuh $
    import { LayoutDashboard, Building2, Users, UserRound, Newspaper, LogOut } from "@lucide/svelte";
    import { authClient } from "$lib/authClient";
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";

    let { isOpen, closeSidebar } = $props<{
        isOpen: boolean;
        closeSidebar: () => void;
    }>();

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Organisasi", path: "/admin/dashboard/organisasi", icon: Building2 },
        { name: "Divisi", path: "/admin/dashboard/devisi", icon: Users },
        { name: "Anggota", path: "/admin/dashboard/member", icon: UserRound },
        { name: "Program Kerja", path: "/admin/dashboard/proker", icon: Newspaper },
    ];

    async function handleLogout() {
        await authClient.signOut();
        goto(resolve("/admin/login"));
    }
</script>

<!-- Backdrop untuk mobile -->
{#if isOpen}
    <div 
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
        onclick={closeSidebar}
        onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
        role="button"
        tabindex="0"
    ></div>
{/if}

<!-- Sidebar Container -->
<aside 
    class="fixed top-0 left-0 h-full w-64 bg-surface border-r border-primary/10 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 glass"
    class:-translate-x-full={!isOpen}
    class:translate-x-0={isOpen}
>
    <!-- Brand / Logo -->
    <div class="h-16 flex items-center px-6 border-b border-primary/10 shrink-0">
        <h1 class="text-2xl font-extrabold tracking-tight gradient-text">HIMATIF</h1>
    </div>

    <!-- Navigation Menu -->
    <div class="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <span class="text-xs font-bold text-secondary uppercase tracking-wider mb-2 ml-2">Menu Utama</span>
        {#each menuItems as item (item.name)}
            {@const isActive = page.url.pathname === item.path || (page.url.pathname.startsWith(item.path) && item.path !== "/admin/dashboard")}
            <a 
                href={item.path} 
                onclick={closeSidebar}
                class="flex items-center gap-3 px-3 py-3 rounded smooth-transition text-primary-text opacity-70 hover:opacity-100 hover:bg-primary/75"
                class:bg-primary={isActive}
                class:bg-opacity-20={isActive}
                class:text-secondary={isActive}
                class:font-bold={isActive}
                class:opacity-100={isActive}
                class:shadow-sm={isActive} //style di !isactive tidak perlu lewat sini kan dari awal sudah gk aktif biarkan taruh distyle biasa nanti akan ketimpah oleh yang active sendiri. atau kalau style ribet buat class css aja sendiri
            >
                <item.icon class="w-5 h-5" />
                <span>{item.name}</span>
            </a>
        {/each}
    </div>

    <!-- Bottom Action (Logout) -->
    <div class="p-4 border-t border-primary/10 shrink-0">
        <button 
            onclick={handleLogout}
            class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded bg-red-500/10 text-red-600 hover:bg-red-500/20 smooth-transition font-bold"
        >
            <LogOut class="w-5 h-5" />
            <span>Keluar</span>
        </button>
    </div>
</aside>