<script lang="ts">
	import { page } from '$app/state';
	import { AlertTriangle, ShieldAlert, FileQuestion } from '@lucide/svelte';
	import './layout.css';

	// $page.error dari state akan menangkap pesan error dan status code
	let errorStatus = $derived(page.status);
	let errorMessage = $derived(page.error?.message || 'Terjadi kesalahan yang tidak terduga.');

	// Menentukan Icon dan Tema Berdasarkan Status Error
	let detail = $derived.by(() => {
		if (errorStatus === 404) {
			return {
				title: 'Halaman Tidak Ditemukan',
				Icon: FileQuestion,
				colorClass: 'text-amber-500',
				bgClass: 'bg-amber-500/10',
				borderClass: 'border-amber-500/20'
			};
		} else if (errorStatus === 401 || errorStatus === 403) {
			return {
				title: 'Akses Ditolak',
				Icon: ShieldAlert,
				colorClass: 'text-red-500',
				bgClass: 'bg-red-500/10',
				borderClass: 'border-red-500/20'
			};
		} else {
			return {
				title: 'Internal Server Error',
				Icon: AlertTriangle,
				colorClass: 'text-red-500',
				bgClass: 'bg-red-500/10',
				borderClass: 'border-red-500/20'
			};
		}
	});

	// Helper navigasi kembali
	function goBack() {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			window.location.href = '/';
		}
	}
</script>

<div
	class="bg-gradient-surface relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4"
>
	<!-- Subtle dot pattern overlay -->
	<div class="bg-dot-pattern pointer-events-none absolute inset-0 opacity-40"></div>

	<div
		class="glass-card relative z-10 flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl border border-primary/20 p-8 text-center shadow-xl md:p-12"
	>
		<!-- Icon Circle -->
		<div
			class="h-24 w-24 rounded-full {detail.bgClass} {detail.colorClass} border {detail.borderClass} mb-2 flex shrink-0 items-center justify-center"
		>
			<detail.Icon class="h-12 w-12" />
		</div>

		<div class="flex flex-col gap-2">
			<h1 class="mb-2 text-7xl font-extrabold tracking-tight text-title-text drop-shadow-sm">
				{errorStatus}
			</h1>
			<h2 class="text-2xl font-bold {detail.colorClass}">
				{detail.title}
			</h2>
			<p class="mx-auto mt-2 max-w-sm text-base leading-relaxed text-primary-text opacity-80">
				{errorMessage}
			</p>
		</div>

		<div class="mt-4 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
			<button
				onclick={goBack}
				class="smooth-transition rounded-full border border-primary/10 bg-white/50 px-6 py-3 font-bold text-primary-text hover:bg-white/80"
			>
				Kembali
			</button>
			<a
				href="/"
				class="btn-cta flex items-center justify-center gap-2 rounded-full px-8 py-3 text-base"
			>
				Ke Beranda
			</a>
		</div>
	</div>
</div>
