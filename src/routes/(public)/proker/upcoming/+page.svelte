<script>
	import { Construction } from '@lucide/svelte';
</script>

<section
	class="bg-gradient-surface section relative mt-7 flex min-h-[70vh] min-w-full flex-col items-center justify-center overflow-hidden px-3"
>
	<div class="bg-dot-pattern pointer-events-none absolute inset-0"></div>

	<div
		class="glass-card hover-lift relative z-10 flex max-w-2xl flex-col items-center rounded-2xl p-10 text-center"
		style="box-shadow: var(--shadow-card-md);"
	>
		<div class="mb-6 rounded-full bg-secondary/10 p-4">
			<Construction size={64} class="text-secondary" strokeWidth={1.5} />
		</div>

		<h1 class="mb-4 text-4xl font-extrabold tracking-tight text-title-text">
			Masih <span class="gradient-text">Dalam Pengerjaan</span>
		</h1>

		<p class="mb-8 text-lg leading-relaxed opacity-80">
			Halaman detail program kerja ini sedang dalam tahap pengembangan. Silakan kembali lagi nanti
			untuk melihat informasi lengkapnya.
		</p>

		<p class="mb-8 text-sm leading-relaxed opacity-80">
			Tim kami sedang sibuk mohon tinggu sebentar. Terima kasih atas pengertiannya.
		</p>

		<a
			href="/proker"
			class="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:-translate-y-1"
			style="background: var(--color-secondary); box-shadow: var(--shadow-md);"
		>
			&larr; Kembali ke Program Kerja
		</a>
	</div>
</section>
