<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormField, TextArea, Toast, ImageUpload } from '$lib/components/admin';
	import { Save, Building2 } from '@lucide/svelte';

	let { data, form } = $props();

	// Default values if empty
	const org = $derived(
		data.organization || {
			nama: '',
			namaLengkap: '',
			visi: '',
			misi: '[]',
			tujuan: '',
			logoSmallUrl: '',
			logoBigUrl: ''
		}
	);

	// Use form action return values if available (for validation errors fallback),
	// otherwise use loaded data
	const initialValues = $derived(
		form?.values || {
			nama: org.nama,
			namaLengkap: org.namaLengkap,
			visi: org.visi,
			misi: parseMisiForTextarea(org.misi),
			tujuan: org.tujuan,
			logoSmallUrl: org.logoSmallUrl,
			logoBigUrl: org.logoBigUrl
		}
	);

	let isSubmitting = $state(false);

	// Toast State
	let showToast = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');

	$effect(() => {
		if (form?.success) {
			toastMessage = form.message || 'Berhasil disimpan';
			toastType = 'success';
			showToast = true;
		} else if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
			showToast = true;
		}
	});

	// Helper to convert JSON array string to newline-separated string
	function parseMisiForTextarea(misiString: string) {
		try {
			const arr = JSON.parse(misiString);
			if (Array.isArray(arr)) return arr.join('\n');
			return misiString;
		} catch {
			return misiString;
		}
	}

	// state reactive properties for image upload values
	let logoSmallUrl = $state(initialValues.logoSmallUrl);
	let logoBigUrl = $state(initialValues.logoBigUrl);

	$effect(() => {
		if (initialValues) {
			logoSmallUrl = initialValues.logoSmallUrl;
			logoBigUrl = initialValues.logoBigUrl;
		}
	});
</script>

<svelte:head>
	<title>Kelola Organisasi - Admin HIMATIF</title>
</svelte:head>

<Toast
	visible={showToast}
	message={toastMessage}
	type={toastType}
	onClose={() => (showToast = false)}
/>

<div class="stack-lg flex max-w-4xl flex-col">
	<div class="flex items-center gap-4 border-b border-primary/10 pb-4">
		<div class="icon-container rounded">
			<Building2 class="h-6 w-6 text-secondary" />
		</div>
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight text-title-text">Organisasi</h1>
			<p class="text-sm text-primary-text opacity-80">
				Ubah identitas, visi, misi, dan tujuan himpunan.
			</p>
		</div>
	</div>

	<div
		class="glass-card hover-lift rounded p-6 shadow-sm md:p-8"
		style="box-shadow: var(--shadow-card-md);"
	>
		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				showToast = false; // Hide previous toast
				return async ({ update }) => {
					await update({ reset: false }); // keep form values on fail
					isSubmitting = false;
				};
			}}
			class="flex flex-col gap-6"
		>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<FormField
					label="Nama Singkat (Singkatan)"
					name="nama"
					value={initialValues.nama}
					required
					error={form?.errors?.nama}
					placeholder="Contoh: HIMATIF"
				/>

				<FormField
					label="Nama Lengkap"
					name="namaLengkap"
					value={initialValues.namaLengkap}
					required
					error={form?.errors?.namaLengkap}
					placeholder="Contoh: Himpunan Mahasiswa..."
				/>
			</div>

			<div
				class="grid grid-cols-1 gap-6 rounded border border-primary/10 bg-primary/5 p-4 md:grid-cols-2"
			>
				<ImageUpload
					name="logoSmallUrl"
					label="Logo Kecil (Navbar)"
					bind:value={logoSmallUrl}
					folder="himatif/org"
					previewSize="long"
					required
					error={form?.errors?.logoSmallUrl}
				/>

				<ImageUpload
					name="logoBigUrl"
					label="Logo Besar (Hero Beranda)"
					bind:value={logoBigUrl}
					folder="himatif/org"
					previewSize="lg"
					required
					error={form?.errors?.logoBigUrl}
				/>
			</div>

			<div class="mt-2 flex flex-col gap-6 border-t border-primary/10 pt-6">
				<h3 class="mb-2 text-lg font-bold text-title-text">Visi, Misi & Tujuan</h3>

				<TextArea
					label="Visi"
					name="visi"
					value={initialValues.visi}
					rows={3}
					required
					error={form?.errors?.visi}
				/>

				<TextArea
					label="Misi"
					name="misi"
					value={initialValues.misi}
					rows={5}
					required
					hint="Tulis satu poin misi per baris (tekan Enter untuk membuat poin baru)."
					error={form?.errors?.misi}
				/>

				<TextArea
					label="Tujuan"
					name="tujuan"
					value={initialValues.tujuan}
					rows={4}
					required
					error={form?.errors?.tujuan}
				/>
			</div>

			<div class="mt-2 flex justify-end pt-4">
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
