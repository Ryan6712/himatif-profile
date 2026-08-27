<script lang="ts">
	import { Users, Building2, Newspaper, FileEdit, ArrowRight } from '@lucide/svelte';

	let { data } = $props();

	const { stats, recentProker } = $derived(data); //pastikan data dari props itu derived biar reactive terhadap perubahaan

	function formatDate(date: Date | string | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div class="stack-lg flex flex-col">
	<div class="flex items-center justify-between">
		<div class="stack-sm">
			<h1 class="text-3xl font-extrabold tracking-tight text-title-text">Dashboard Overview</h1>
			<p class="text-base text-primary-text opacity-80">Ringkasan data profil HIMATIF</p>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Card 1 -->
		<div
			class="glass-card hover-lift flex flex-col gap-4 rounded p-6"
			style="box-shadow: var(--shadow-card-md);"
		>
			<div class="flex items-center gap-4">
				<div class="icon-container rounded">
					<Building2 class="h-7 w-7 text-secondary" />
				</div>
				<div>
					<p class="text-sm font-semibold text-primary-text opacity-80">Total Divisi</p>
					<h3 class="text-3xl font-extrabold tracking-tight text-title-text">
						{stats.devisiCount}
					</h3>
				</div>
			</div>
		</div>

		<!-- Card 2 -->
		<div
			class="glass-card hover-lift flex flex-col gap-4 rounded p-6"
			style="box-shadow: var(--shadow-card-md);"
		>
			<div class="flex items-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-sm"
				>
					<Users class="h-6 w-6" />
				</div>
				<div>
					<p class="text-sm font-semibold text-primary-text opacity-80">Total Anggota</p>
					<h3 class="text-3xl font-extrabold tracking-tight text-title-text">
						{stats.memberCount}
					</h3>
				</div>
			</div>
		</div>

		<!-- Card 3 -->
		<div
			class="glass-card hover-lift flex flex-col gap-4 rounded p-6"
			style="box-shadow: var(--shadow-card-md);"
		>
			<div class="flex items-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded border border-green-500/20 bg-green-500/10 text-green-600 shadow-sm"
				>
					<Newspaper class="h-6 w-6" />
				</div>
				<div>
					<p class="text-sm font-semibold text-primary-text opacity-80">Proker Publish</p>
					<h3 class="text-3xl font-extrabold tracking-tight text-title-text">
						{stats.prokerPublished}
					</h3>
				</div>
			</div>
		</div>

		<!-- Card 4 -->
		<div
			class="glass-card hover-lift flex flex-col gap-4 rounded p-6"
			style="box-shadow: var(--shadow-card-md);"
		>
			<div class="flex items-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded border border-amber-500/20 bg-amber-500/10 text-amber-600 shadow-sm"
				>
					<FileEdit class="h-6 w-6" />
				</div>
				<div>
					<p class="text-sm font-semibold text-primary-text opacity-80">Proker Draft</p>
					<h3 class="text-3xl font-extrabold tracking-tight text-title-text">
						{stats.prokerDraft}
					</h3>
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Proker Table -->
	<div
		class="glass-card flex flex-col overflow-hidden rounded"
		style="box-shadow: var(--shadow-card-md);"
	>
		<div class="flex items-center justify-between border-b border-primary/10 bg-white/30 p-6">
			<h2 class="text-xl font-extrabold text-title-text">Program Kerja Terbaru</h2>
			<a
				href="/admin/dashboard/proker"
				class="smooth-transition group inline-flex items-center gap-1 text-sm font-bold text-secondary hover:text-primary"
			>
				Lihat Semua <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
			</a>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="bg-primary/5 text-sm font-bold tracking-wider text-secondary uppercase">
						<th class="px-6 py-4">Judul Proker</th>
						<th class="px-6 py-4">Tanggal Kegiatan</th>
						<th class="px-6 py-4">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-primary/10 bg-white/20">
					{#each recentProker as proker (proker.title)}
						<!-- pastikan kalau pakai each ada keynya kamu bisa pakai variable apapun yang penting value nya berbeda setiap loop -->
						<tr class="smooth-transition group hover:bg-white/40">
							<td class="px-6 py-4">
								<span class="block font-bold text-title-text">{proker.title}</span>
								<span class="mt-1 block text-xs text-primary-text opacity-60">/{proker.slug}</span>
							</td>
							<td class="px-6 py-4 text-sm font-semibold text-primary-text opacity-80">
								{formatDate(proker.date)}
							</td>
							<td class="px-6 py-4">
								{#if proker.publishedAt}
									<span
										class="rounded border border-green-500/30 bg-green-500/20 px-3 py-1 text-xs font-bold text-green-700"
									>
										Published
									</span>
								{:else}
									<span
										class="rounded border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700"
									>
										Draft
									</span>
								{/if}
							</td>
						</tr>
					{/each}

					{#if recentProker.length === 0}
						<tr>
							<td
								colspan="3"
								class="bg-white/20 px-6 py-8 text-center font-semibold text-primary-text opacity-60"
							>
								Belum ada program kerja yang ditambahkan.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
