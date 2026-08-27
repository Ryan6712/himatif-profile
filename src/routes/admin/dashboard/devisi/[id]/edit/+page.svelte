<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormField, TextArea, Toast, ImageUpload } from '$lib/components/admin';
	import { Save, ArrowLeft } from '@lucide/svelte';

	let { data, form } = $props();

	// The data is loaded from the server
	const currentDivisi = $derived(data.divisi);

	// Initialize values from form state (fallback for failed submissions)
	// or use loaded data
	const initialValues = $derived(
		form?.values || {
			nama: currentDivisi.nama,
			namaLengkap: currentDivisi.namaLengkap,
			logoUrl: currentDivisi.logoUrl,
			thumbnailUrl: currentDivisi.thumbnailUrl || '',
			deskripsi: currentDivisi.deskripsi
		}
	);

	let isSubmitting = $state(false);

	// Toast State
	let showToast = $state(false);
	let toastMessage = $state('');

	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			showToast = true;
		}
	});

	let logoUrl = $state(initialValues.logoUrl);
	let thumbnailUrl = $state(initialValues.thumbnailUrl);
</script>

<svelte:head>
	<title>Edit {currentDivisi.nama} - Admin HIMATIF</title>
</svelte:head>

<Toast
	visible={showToast}
	message={toastMessage}
	type="error"
	onClose={() => (showToast = false)}
/>

<div class="stack-lg flex max-w-4xl flex-col">
	<div class="flex items-center gap-4 border-b border-primary/10 pb-4">
		<a
			href="/admin/dashboard/devisi"
			class="icon-container smooth-transition rounded hover:bg-primary/10"
		>
			<ArrowLeft class="h-6 w-6 text-title-text" />
		</a>
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight text-title-text">
				Edit Divisi <span class="gradient-text">{currentDivisi.nama}</span>
			</h1>
			<p class="text-sm text-primary-text opacity-80">
				Perbarui informasi detail departemen HIMATIF.
			</p>
		</div>
	</div>

	<div
		class="glass-card hover-lift mt-2 rounded p-6 shadow-sm md:p-8"
		style="box-shadow: var(--shadow-card-md);"
	>
		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				showToast = false;
				return async ({ update }) => {
					await update({ reset: false }); // keep form values on fail
					isSubmitting = false;
				};
			}}
			class="flex flex-col gap-6"
		>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<FormField
					label="Nama Singkat"
					name="nama"
					value={initialValues.nama}
					required
					error={form?.errors?.nama}
					placeholder="Contoh: Kominfo"
				/>

				<FormField
					label="Nama Lengkap"
					name="namaLengkap"
					value={initialValues.namaLengkap}
					required
					error={form?.errors?.namaLengkap}
					placeholder="Contoh: Komunikasi dan Informasi"
				/>
			</div>

			<div
				class="grid grid-cols-1 gap-6 rounded border border-primary/10 bg-primary/5 p-4 md:grid-cols-2"
			>
				<ImageUpload
					name="logoUrl"
					label="Logo Divisi (Icon)"
					bind:value={logoUrl}
					folder="himatif/divisi"
					previewSize="sm"
					required
					error={form?.errors?.logoUrl}
				/>

				<ImageUpload
					name="thumbnailUrl"
					label="Thumbnail (Cover)"
					bind:value={thumbnailUrl}
					folder="himatif/divisi"
					previewSize="md"
					error={form?.errors?.thumbnailUrl}
				/>
			</div>

			<div class="mt-2 border-t border-primary/10 pt-6">
				<TextArea
					label="Deskripsi Divisi"
					name="deskripsi"
					value={initialValues.deskripsi}
					rows={5}
					required
					error={form?.errors?.deskripsi}
					placeholder="Jelaskan peran dan tugas divisi ini..."
				/>
			</div>

			<div class="mt-2 flex justify-end gap-3 pt-4">
				<a
					href="/admin/dashboard/devisi"
					class="smooth-transition rounded border border-primary/10 bg-white/50 px-6 py-3 font-bold text-primary-text hover:bg-white/80"
				>
					Batal
				</a>
				<button
					type="submit"
					disabled={isSubmitting}
					class="btn-cta flex items-center gap-2 rounded-full px-8 py-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSubmitting}
						<span class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
						></span>
						<span>Menyimpan...</span>
					{:else}
						<Save class="h-5 w-5" />
						<span>Simpan Perubahan</span>
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
