<script lang="ts">
	import { enhance } from '$app/forms';
	import { Toast, ConfirmDialog } from '$lib/components/admin';
	import {
		Newspaper,
		Plus,
		Pencil,
		Trash2,
		Search,
		FilterX,
		ChevronLeft,
		ChevronRight,
		Eye,
		ToggleLeft,
		ToggleRight
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { resolve } from '$app/paths';

	let { data, form } = $props();

	const prokerList = $derived(data.prokerList || []);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);

	let searchInput = $state('');
	let selectedStatus = $state('');

	$effect(() => {
		searchInput = filters.search;
		selectedStatus = filters.status;
	});

	let showToast = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');

	$effect(() => {
		if (form?.success) {
			toastMessage = form.message || 'Berhasil';
			toastType = 'success';
			showToast = true;
		} else if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
			showToast = true;
		}
	});

	let showDeleteModal = $state(false);
	let deletingId = $state<number | null>(null);
	let deletingName = $state('');
	let isDeleting = $state(false);
	let isToggling = $state(false); // Untuk status loading toggle publish

	function triggerDelete(id: number, nama: string) {
		deletingId = id;
		deletingName = nama;
		showDeleteModal = true;
	}

	let deleteForm: HTMLFormElement;
	function confirmDelete() {
		if (deleteForm && deletingId) {
			deleteForm.requestSubmit();
		}
	}

	function getPageUrl(targetPage: number) {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		params.set('page', String(targetPage));
		return `?${params.toString()}`;
	}

	function applyFilters() {
		const params = new SvelteURLSearchParams(); // selalu pakai SvelteURLSearchParams
		if (searchInput) params.set('search', searchInput);
		if (selectedStatus) params.set('status', selectedStatus);
		params.set('page', '1');
		goto(resolve(`/admin/dashboard/proker?${params.toString()}`)); // kalau pakai goto selalu call dengan resolve $app/path
	}

	function resetFilters() {
		searchInput = '';
		selectedStatus = '';
		goto(resolve(`/admin/dashboard/proker?`)); // kalau pakai goto selalu call dengan resolve $app/path
	}

	function formatDate(dateStr: Date | string | null) {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Kelola Program Kerja - Admin HIMATIF</title>
</svelte:head>

<Toast
	visible={showToast}
	message={toastMessage}
	type={toastType}
	onClose={() => (showToast = false)}
/>

<ConfirmDialog
	title="Hapus Program Kerja"
	message="Apakah Anda yakin ingin menghapus artikel '{deletingName}'? Aksi ini tidak dapat dibatalkan."
	visible={showDeleteModal}
	isLoading={isDeleting}
	onCancel={() => {
		showDeleteModal = false;
		deletingId = null;
	}}
	onConfirm={confirmDelete}
/>

<form
	method="POST"
	action="?/delete"
	bind:this={deleteForm}
	class="hidden"
	use:enhance={() => {
		isDeleting = true;
		return async ({ update }) => {
			await update();
			isDeleting = false;
			showDeleteModal = false;
			deletingId = null;
		};
	}}
>
	<input type="hidden" name="id" value={deletingId} />
</form>

<div class="stack-lg flex flex-col">
	<!-- Header -->
	<div
		class="flex flex-col justify-between gap-4 border-b border-primary/10 pb-4 sm:flex-row sm:items-center"
	>
		<div class="flex items-center gap-4">
			<div class="icon-container rounded">
				<Newspaper class="h-6 w-6 text-secondary" />
			</div>
			<div>
				<h1 class="text-3xl font-extrabold tracking-tight text-title-text">Program Kerja (Blog)</h1>
				<p class="text-sm text-primary-text opacity-80">Kelola artikel kegiatan himpunan.</p>
			</div>
		</div>
		<a
			href="/admin/dashboard/proker/tambah"
			class="btn-cta flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm sm:self-auto"
		>
			<Plus class="h-4 w-4" />
			<span>Tulis Artikel Baru</span>
		</a>
	</div>

	<!-- Filters -->
	<div class="glass-card flex flex-col items-center gap-4 rounded p-4 shadow-sm md:flex-row">
		<!-- Search -->
		<div class="relative w-full flex-1 md:w-auto">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-50" />
			<input
				type="text"
				bind:value={searchInput}
				onkeydown={(e) => e.key === 'Enter' && applyFilters()}
				placeholder="Cari judul..."
				class="w-full rounded border border-primary/10 bg-background/50 py-2 pr-4 pl-9 text-sm outline-none focus:ring-1 focus:ring-primary/50"
			/>
		</div>

		<!-- Tipe Dropdown -->
		<select
			bind:value={selectedStatus}
			onchange={applyFilters}
			class="w-full rounded border border-primary/10 bg-background/50 px-3 py-2 text-sm outline-none md:w-40"
		>
			<option value="">Semua Status</option>
			<option value="published">Published</option>
			<option value="draft">Draft</option>
		</select>

		<button
			onclick={resetFilters}
			class="smooth-transition rounded bg-red-500/10 p-2.5 text-red-500 hover:bg-red-500/20"
			title="Reset Filter"
		>
			<FilterX class="h-4 w-4" />
		</button>
	</div>

	<!-- Table -->
	<div
		class="glass-card hover-lift mt-2 flex flex-col overflow-hidden rounded shadow-sm"
		style="box-shadow: var(--shadow-card-md);"
	>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="bg-primary/5 text-sm font-bold tracking-wider text-secondary uppercase">
						<th class="w-16 px-6 py-4 text-center">No</th>
						<th class="px-6 py-4">Informasi Artikel</th>
						<th class="px-6 py-4 text-center">Tanggal Acara</th>
						<th class="px-6 py-4 text-center">Status</th>
						<th class="w-44 px-6 py-4 text-right">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-primary/10 bg-white/20">
					{#each prokerList as item, i (item.id)}
						<tr class="smooth-transition group hover:bg-white/40">
							<td class="px-6 py-4 text-center font-semibold text-primary-text opacity-70">
								{(pagination.page - 1) * pagination.limit + i + 1}
							</td>
							<td class="px-6 py-4">
								<span class="block max-w-sm truncate font-bold text-title-text" title={item.title}
									>{item.title}</span
								>
								<span class="mt-1 block text-xs text-primary-text opacity-60">/{item.slug}</span>
							</td>
							<td class="px-6 py-4 text-center text-sm font-semibold opacity-80">
								{formatDate(item.date)}
							</td>
							<td class="px-6 py-4 text-center">
								{#if item.publishedAt}
									<span
										class="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-600"
									>
										Published
									</span>
								{:else}
									<span
										class="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600"
									>
										Draft
									</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<!-- Preview Public Link -->
									{#if item.publishedAt}
										<a
											href="/proker/{item.slug}"
											target="_blank"
											class="smooth-transition rounded bg-slate-500/10 p-2 text-slate-500 hover:bg-slate-500/20"
											title="Preview Public"
										>
											<Eye class="h-4 w-4" />
										</a>
									{/if}

									<!-- Toggle Status Form Action -->
									<form
										method="POST"
										action="?/togglePublish"
										class="inline"
										use:enhance={() => {
											isToggling = true;
											return async ({ update }) => {
												await update();
												isToggling = false;
											};
										}}
									>
										<input type="hidden" name="id" value={item.id} />
										<button
											type="submit"
											disabled={isToggling}
											class="smooth-transition rounded bg-emerald-500/10 p-2 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50"
											title={item.publishedAt
												? 'Batalkan Publish (Jadikan Draft)'
												: 'Publish Sekarang'}
										>
											{#if item.publishedAt}
												<ToggleRight class="h-4 w-4" />
											{:else}
												<ToggleLeft class="h-4 w-4" />
											{/if}
										</button>
									</form>

									<!-- Edit -->
									<a
										href="/admin/dashboard/proker/{item.id}/edit"
										class="smooth-transition rounded bg-blue-500/10 p-2 text-blue-500 hover:bg-blue-500/20"
										title="Edit"
									>
										<Pencil class="h-4 w-4" />
									</a>

									<!-- Delete -->
									<button
										type="button"
										onclick={() => triggerDelete(item.id, item.title)}
										class="smooth-transition rounded bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
										title="Hapus"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							</td>
						</tr>
					{/each}

					{#if prokerList.length === 0}
						<tr>
							<td
								colspan="5"
								class="bg-white/20 px-6 py-10 text-center font-semibold text-primary-text opacity-60"
							>
								Tidak ada data program kerja/blog yang sesuai.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if pagination.totalPages > 1}
			<div
				class="flex items-center justify-between border-t border-primary/10 bg-white/30 p-4 text-sm"
			>
				<span class="opacity-70">
					Menampilkan {(pagination.page - 1) * pagination.limit + 1} -
					{Math.min(pagination.page * pagination.limit, pagination.totalCount)}
					dari {pagination.totalCount}
				</span>

				<div class="flex gap-2">
					<a
						href={getPageUrl(pagination.page - 1)}
						class="smooth-transition rounded border border-primary/10 bg-background p-2 hover:bg-primary/10"
						class:opacity-50={pagination.page <= 1}
						class:pointer-events-none={pagination.page <= 1}
					>
						<ChevronLeft class="h-4 w-4" />
					</a>

					<a
						href={getPageUrl(pagination.page + 1)}
						class="smooth-transition rounded border border-primary/10 bg-background p-2 hover:bg-primary/10"
						class:opacity-50={pagination.page >= pagination.totalPages}
						class:pointer-events-none={pagination.page >= pagination.totalPages}
					>
						<ChevronRight class="h-4 w-4" />
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
