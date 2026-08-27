<script lang="ts">
	import '../../layout.css';
	import Sidebar from '$lib/components/admin/Sidebar.svelte';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';

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
<div
	class="bg-gradient-surface relative flex min-h-screen w-full overflow-x-hidden text-primary-text"
>
	<!-- Sidebar -->
	<Sidebar isOpen={isSidebarOpen} {closeSidebar} />

	<!-- Main Content Area -->
	<div
		class="relative z-10 flex min-h-screen w-full flex-1 flex-col transition-all duration-300 lg:ml-64"
	>
		<AdminHeader {toggleSidebar} user={data.user!} />

		<!-- Main content -->
		<main class="relative flex-1 p-4 md:p-6 lg:p-8">
			<!-- Background pattern for admin area -->
			<div class="bg-dot-pattern pointer-events-none absolute inset-0 z-0 opacity-40"></div>

			<div class="relative z-10 mx-auto w-full max-w-7xl">
				{@render children()}
			</div>
		</main>
	</div>
</div>
