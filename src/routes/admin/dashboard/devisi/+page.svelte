<script lang="ts">
	import { enhance } from '$app/forms';
	import { Toast, ConfirmDialog } from '$lib/components/admin';
	import { Users, Plus, Pencil, Trash2 } from '@lucide/svelte';

	let { data, form } = $props();

	// Derived state untuk divisiList agar reaktif jika load berubah
	const divisiList = $derived(data.divisiList || []);

	// State untuk Toast Notifikasi
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

	// State untuk Confirm Dialog Delete
	let showDeleteModal = $state(false);
	let deletingId = $state<number | null>(null);
	let deletingName = $state('');
	let isDeleting = $state(false);

	function triggerDelete(id: number, nama: string) {
		deletingId = id;
		deletingName = nama;
		showDeleteModal = true;
	}

	// Submit form tersembunyi secara programatik
	let deleteForm: HTMLFormElement;
	function confirmDelete() {
		if (deleteForm && deletingId) {
			deleteForm.requestSubmit();
		}
	}
</script>

<Toast
	visible={showToast}
	message={toastMessage}
	type={toastType}
	onClose={() => (showToast = false)}
/>

<ConfirmDialog
	title="Hapus Divisi"
	message="Apakah Anda yakin ingin menghapus divisi '{deletingName}'? Semua anggota dalam divisi ini akan menjadi tanpa divisi (Unassigned)."
	visible={showDeleteModal}
	isLoading={isDeleting}
	onCancel={() => {
		showDeleteModal = false;
		deletingId = null;
	}}
	onConfirm={confirmDelete}
/>

<!-- Form tersembunyi untuk delete request via enhance -->
<form
	method="POST"
	action="?/delete"
	bind:this={deleteForm}
	use:enhance={() => {
		isDeleting = true;
		return async ({ update }) => {
			await update();
			isDeleting = false;
			showDeleteModal = false;
			deletingId = null;
		};
	}}
	class="hidden"
>
	<input type="hidden" name="id" value={deletingId} />
</form>

<div class="stack-lg flex flex-col">
	<!-- Header Page -->
	<div
		class="flex flex-col justify-between gap-4 border-b border-primary/10 pb-4 sm:flex-row sm:items-center"
	>
		<div class="flex items-center gap-4">
			<div class="icon-container rounded">
				<Users class="h-6 w-6 text-secondary" />
			</div>
			<div>
				<h1 class="text-3xl font-extrabold tracking-tight text-title-text">Kelola Divisi</h1>
				<p class="text-sm text-primary-text opacity-80">Daftar divisi/departemen dalam HIMATIF.</p>
			</div>
		</div>
		<a
			href="/admin/dashboard/devisi/tambah"
			class="btn-cta flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm sm:self-auto"
		>
			<Plus class="h-4 w-4" />
			<span>Tambah Divisi</span>
		</a>
	</div>

	<!-- Table Card -->
	<div
		class="glass-card hover-lift mt-2 flex flex-col overflow-hidden rounded shadow-sm"
		style="box-shadow: var(--shadow-card-md);"
	>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="bg-primary/5 text-sm font-bold tracking-wider text-secondary uppercase">
						<th class="w-16 px-6 py-4 text-center">No</th>
						<th class="w-20 px-6 py-4 text-center">Logo</th>
						<th class="px-6 py-4">Informasi Divisi</th>
						<th class="px-6 py-4 text-center">Anggota</th>
						<th class="w-32 px-6 py-4 text-right">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-primary/10 bg-white/20">
					{#each divisiList as item, i (item.id)}
						<tr class="smooth-transition group hover:bg-white/40">
							<td class="px-6 py-4 text-center font-semibold text-primary-text opacity-70">
								{i + 1}
							</td>
							<td class="px-6 py-4 text-center">
								<div
									class="mx-auto h-10 w-10 overflow-hidden rounded border border-primary/20 bg-white/50 p-1"
								>
									<img
										src={item.logoUrl}
										alt="Logo"
										width="40"
										height="40"
										loading="lazy"
										decoding="async"
										class="h-full w-full object-contain"
									/>
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="block text-base font-bold text-title-text">{item.nama}</span>
								<span class="mt-0.5 block text-sm text-primary-text opacity-70"
									>{item.namaLengkap}</span
								>
							</td>
							<td class="px-6 py-4 text-center">
								<span
									class="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary"
								>
									{item._count.member}
								</span>
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<a
										href="/admin/dashboard/devisi/{item.id}/edit"
										class="smooth-transition rounded bg-blue-500/10 p-2 text-blue-500 hover:bg-blue-500/20"
										title="Edit"
									>
										<Pencil class="h-4 w-4" />
									</a>
									<button
										type="button"
										onclick={() => triggerDelete(item.id, item.nama)}
										class="smooth-transition rounded bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
										title="Hapus"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							</td>
						</tr>
					{/each}

					{#if divisiList.length === 0}
						<tr>
							<td
								colspan="5"
								class="bg-white/20 px-6 py-10 text-center font-semibold text-primary-text opacity-60"
							>
								<p>Belum ada data divisi.</p>
								<a
									href="/admin/dashboard/devisi/tambah"
									class="mt-2 inline-block text-primary hover:underline"
									>Mulai tambahkan sekarang.</a
								>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
