<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormField, Toast, ImageUpload } from '$lib/components/admin';
	import { Save, ArrowLeft, Image as ImageIcon } from '@lucide/svelte';

	let { data, form } = $props();

	const devisiList = data.devisiList;
	const currentMember = data.member;

	const initialValues = form?.values || {
		name: currentMember.name,
		imageUrl: currentMember.imageUrl,
		memberType: currentMember.memberType,
		devisiId: currentMember.devisiId?.toString() || ''
	};

	let isSubmitting = $state(false);
	let selectedType = $state(initialValues.memberType);
	let imageUrl = $state(initialValues.imageUrl);

	// Auto disable devisi for BPH & ALUMNI
	let isDevisiDisabled = $derived(selectedType === 'BPH' || selectedType === 'ALUMNI');

	let showToast = $state(false);
	let toastMessage = $state('');

	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			showToast = true;
		}
	});
</script>

<Toast
	visible={showToast}
	message={toastMessage}
	type="error"
	onClose={() => (showToast = false)}
/>

<div class="stack-lg flex max-w-4xl flex-col">
	<div class="flex items-center gap-4 border-b border-primary/10 pb-4">
		<a
			href="/admin/dashboard/member"
			class="icon-container smooth-transition rounded hover:bg-primary/10"
		>
			<ArrowLeft class="h-6 w-6 text-title-text" />
		</a>
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight text-title-text">
				Edit Anggota <span class="gradient-text">{currentMember.name}</span>
			</h1>
			<p class="text-sm text-primary-text opacity-80">
				Ubah informasi, posisi, atau divisi anggota.
			</p>
		</div>
	</div>

	<div
		class="glass-card hover-lift mt-2 rounded p-6 shadow-sm md:p-8"
		style="box-shadow: var(--shadow-card-md);"
	>
		<form
			method="POST"
			class="flex flex-col gap-6"
			use:enhance={() => {
				isSubmitting = true;
				showToast = false;
				return async ({ update }) => {
					await update({ reset: false });
					isSubmitting = false;
				};
			}}
		>
			<FormField
				label="Nama Lengkap"
				name="name"
				value={initialValues.name}
				required
				error={form?.errors?.name}
				placeholder="Nama Anggota"
			/>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Dropdown Tipe -->
				<div class="form-control flex flex-col gap-2">
					<label for="memberType" class="text-sm font-bold text-primary-text opacity-90"
						>Tipe Anggota <span class="text-red-500">*</span></label
					>
					<select
						id="memberType"
						name="memberType"
						bind:value={selectedType}
						required
						class="smooth-transition w-full rounded border border-primary/20 bg-background/80 px-4 py-3 text-title-text focus:ring-2 focus:ring-primary/50 focus:outline-none"
					>
						<option value="REGULAR">Anggota Biasa (REGULAR)</option>
						<option value="KADIV">Ketua Divisi (KADIV)</option>
						<option value="BPH">Badan Pengurus Harian (BPH)</option>
						<option value="ALUMNI">Alumni</option>
					</select>
				</div>

				<!-- Dropdown Divisi -->
				<div class="form-control flex flex-col gap-2">
					<label
						for="devisiId"
						class="text-sm font-bold text-primary-text opacity-90"
						class:opacity-50={isDevisiDisabled}
					>
						Divisi
					</label>
					<select
						id="devisiId"
						name="devisiId"
						disabled={isDevisiDisabled}
						value={initialValues.devisiId}
						class="smooth-transition w-full rounded border border-primary/20 bg-background/80 px-4 py-3 text-title-text focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">-- Pilih Divisi --</option>
						{#each devisiList as dev}
							<option value={dev.id}>{dev.nama}</option>
						{/each}
					</select>
					{#if isDevisiDisabled}
						<span class="mt-1 text-xs text-primary-text opacity-60"
							>BPH & Alumni tidak terikat pada divisi khusus.</span
						>
					{/if}
				</div>
			</div>

			<!-- URL Foto -->
			<div
				class="flex flex-col gap-6 rounded border border-primary/10 bg-primary/5 p-4 md:flex-row"
			>
				<div class="flex flex-1 flex-col justify-center gap-4">
					<ImageUpload
						name="imageUrl"
						label="Foto Anggota"
						bind:value={imageUrl}
						folder="himatif/members"
						previewSize="md"
						required
						error={form?.errors?.imageUrl}
					/>
				</div>
			</div>

			<!-- Submit -->
			<div class="mt-2 flex justify-end gap-3 border-t border-primary/10 pt-4">
				<a
					href="/admin/dashboard/member"
					class="smooth-transition rounded border border-primary/10 bg-white/50 px-6 py-3 font-bold text-primary-text hover:bg-white/80"
					>Batal</a
				>
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
