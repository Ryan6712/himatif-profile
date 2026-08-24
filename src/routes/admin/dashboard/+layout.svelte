<script lang="ts">
	import '../../layout.css';
    import Sidebar from "$lib/components/admin/Sidebar.svelte";
    import AdminHeader from "$lib/components/admin/AdminHeader.svelte";

	const { children, data } = $props();
    
    let isSidebarOpen = $state(false);

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
    }

    function closeSidebar() {
        isSidebarOpen = false;
    }
</script>

<!-- Wrapper for entire admin layout -->
<!-- Memastikan bg-gradient-surface dari base.css diaplikasikan penuh -->
<div class="min-h-screen bg-gradient-surface text-primary-text flex w-full relative overflow-x-hidden">
    <!-- Sidebar -->
    <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-screen lg:ml-64 w-full transition-all duration-300 relative z-10">
        <AdminHeader toggleSidebar={toggleSidebar} user={data.user!} />
        
        <!-- Main content -->
        <main class="flex-1 p-4 md:p-6 lg:p-8 relative">
            <!-- Background pattern for admin area -->
            <div class="absolute inset-0 bg-dot-pattern pointer-events-none opacity-40 z-0"></div>
            
            <div class="relative z-10 w-full max-w-7xl mx-auto">
                {@render children()}
            </div>
        </main>
    </div>
</div>