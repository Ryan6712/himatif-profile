<script lang="ts">
	import { enhance } from '$app/forms';
	import { Toast, ConfirmDialog } from '$lib/components/admin';
	import {
		UserRound,
		Plus,
		Pencil,
		Trash2,
		FilterX,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { resolve } from '$app/paths';

	let { data, form } = $props();

	const members = $derived(data.members || []);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const devisiList = $derived(data.devisiList || []);

	// Toast State
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

	// Delete State
	let showDeleteModal = $state(false);
	let deletingId = $state<number | null>(null);
	let deletingName = $state('');
	let isDeleting = $state(false);

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

	// Helper Filter
	function applyFilters() {
		const params = new SvelteURLSearchParams(); //gunakna SvelteURLSearchParams jangan pakai URLSearchParams
		if (filters.search) params.set('search', filters.search);
		if (filters.type) params.set('type', filters.type);
		if (filters.devisiId) params.set('devisi', filters.devisiId);
		params.set('page', '1'); // Reset ke page 1 tiap ganti filter

		goto(resolve(`/admin/dashboard/member?${params.toString()}`)); //gunakan relove dari $app/paths untuk menggunakan goto dan pastikan url nya sesuai
	}

	function resetFilters() {
		filters.search = '';
		filters.type = '';
		filters.devisiId = '';
		goto(resolve('/admin/dashboard/member?'));
	}

	// Badge Color Mapping
	const getBadgeStyle = (type: string) => {
		switch (type) {
			case 'BPH':
				return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
			case 'KADIV':
				return 'bg-green-500/10 text-green-500 border border-green-500/20';
			case 'ALUMNI':
				return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
			default:
				return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
		}
	};
</script>

<svelte:head>
	<title>Kelola Anggota - Admin HIMATIF</title>
</svelte:head>

<Toast
	visible={showToast}
	message={toastMessage}
	type={toastType}
	onClose={() => (showToast = false)}
/>

<ConfirmDialog
	title="Hapus Anggota"
	message="Apakah Anda yakin ingin menghapus anggota '{deletingName}'?"
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
				<UserRound class="h-6 w-6 text-secondary" />
			</div>
			<div>
				<h1 class="text-3xl font-extrabold tracking-tight text-title-text">Kelola Anggota</h1>
				<p class="text-sm text-primary-text opacity-80">Daftar struktur dan anggota HIMATIF.</p>
			</div>
		</div>
		<a
			href="/admin/dashboard/member/tambah"
			class="btn-cta flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm sm:self-auto"
		>
			<Plus class="h-4 w-4" />
			<span>Tambah Anggota</span>
		</a>
	</div>

	<!-- Filters -->
	<div class="glass-card flex flex-col items-center gap-4 rounded p-4 shadow-sm md:flex-row">
		<!-- Search -->
		<div class="relative w-full md:w-auto">
			<input
				type="text"
				bind:value={filters.search}
				onkeydown={(e) => e.key === 'Enter' && applyFilters()}
				placeholder="Cari nama anggota..."
				class="w-full rounded border border-primary/10 bg-background/50 py-2 pr-4 pl-9 text-sm outline-none focus:ring-1 focus:ring-primary/50"
			/>
		</div>

		<!-- Tipe Dropdown -->
		<select
			bind:value={filters.type}
			onchange={applyFilters}
			class="w-full rounded border border-primary/10 bg-background/50 px-3 py-2 text-sm outline-none md:w-40"
		>
			<option value="">Semua Tipe</option>
			<option value="BPH">BPH</option>
			<option value="KADIV">KADIV</option>
			<option value="REGULAR">REGULAR</option>
			<option value="ALUMNI">ALUMNI</option>
		</select>

		<!-- Divisi Dropdown -->
		<select
			bind:value={filters.devisiId}
			onchange={applyFilters}
			class="w-full rounded border border-primary/10 bg-background/50 px-3 py-2 text-sm outline-none md:w-48"
		>
			<option value="">Semua Divisi</option>
			{#each devisiList as dev (dev.id)}
				<option value={dev.id}>{dev.nama}</option>
			{/each}
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
						<th class="w-20 px-6 py-4 text-center">Foto</th>
						<th class="px-6 py-4">Informasi Anggota</th>
						<th class="px-6 py-4 text-center">Tipe</th>
						<th class="px-6 py-4 text-center">Divisi</th>
						<th class="w-32 px-6 py-4 text-right">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-primary/10 bg-white/20">
					{#each members as item, i (item.id)}
						<tr class="smooth-transition group hover:bg-white/40">
							<td class="px-6 py-4 text-center font-semibold text-primary-text opacity-70">
								{(pagination.page - 1) * pagination.limit + i + 1}
							</td>
							<td class="px-6 py-4 text-center">
								<div
									class="mx-auto h-10 w-10 overflow-hidden rounded-full border border-primary/20 bg-white"
								>
									<img
										src={item.imageUrl}
										alt={item.name}
										width="40"
										height="40"
										loading="lazy"
										decoding="async"
										class="h-full w-full object-cover"
									/>
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="block font-bold text-title-text">{item.name}</span>
							</td>
							<td class="px-6 py-4 text-center">
								<span
									class="rounded-full px-3 py-1 text-xs font-bold {getBadgeStyle(item.memberType)}"
								>
									{item.memberType}
								</span>
							</td>
							<td class="px-6 py-4 text-center text-sm font-semibold opacity-80">
								{item.devisi?.nama || '-'}
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<a
										href="/admin/dashboard/member/{item.id}/edit"
										class="smooth-transition rounded bg-blue-500/10 p-2 text-blue-500 hover:bg-blue-500/20"
									>
										<Pencil class="h-4 w-4" />
									</a>
									<button
										type="button"
										onclick={() => triggerDelete(item.id, item.name)}
										class="smooth-transition rounded bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							</td>
						</tr>
					{/each}

					{#if members.length === 0}
						<tr>
							<td
								colspan="6"
								class="bg-white/20 px-6 py-10 text-center font-semibold text-primary-text opacity-60"
							>
								Tidak ada data yang sesuai dengan filter pencarian.
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
