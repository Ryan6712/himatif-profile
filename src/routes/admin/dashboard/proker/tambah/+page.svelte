<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormField, TextArea, Toast, ImageUpload, RichTextEditor } from '$lib/components/admin';
	import { Save, ArrowLeft, Send } from '@lucide/svelte';
	import { generateSlug } from '$lib/utils/slug';

	let { form } = $props();

	const initialValues = $derived(
		form?.values || {
			title: '',
			slug: '',
			date: '',
			thumbnailUrl: '',
			description: '',
			content: ''
		}
	);

	let isSubmitting = $state(false);
	let isPublishing = $state(false); // flag yg menandakan action yg dipilih user

	// UI states
	let title = $state(initialValues.title);
	let slug = $state(initialValues.slug);
	let thumbnailUrl = $state(initialValues.thumbnailUrl);
	let slugManuallyEdited = $state(false);

	$effect(() => {
		if (initialValues) {
			title = initialValues.title;
			slug = initialValues.slug;
			thumbnailUrl = initialValues.thumbnailUrl;
		}
	});

	let showToast = $state(false);
	let toastMessage = $state('');

	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			showToast = true;
		}
	});

	// Auto-generate slug dari title
	$effect(() => {
		if (!slugManuallyEdited && title) {
			slug = generateSlug(title);
		}
	});

	function handleSlugInput() {
		slugManuallyEdited = true;
	}
</script>

<svelte:head>
	<title>Tulis Artikel Baru - Admin HIMATIF</title>
</svelte:head>

<Toast
	visible={showToast}
	message={toastMessage}
	type="error"
	onClose={() => (showToast = false)}
/>

<div class="stack-lg mx-auto flex max-w-4xl flex-col">
	<div class="flex items-center gap-4 border-b border-primary/10 pb-4">
		<a
			href="/admin/dashboard/proker"
			class="icon-container smooth-transition rounded hover:bg-primary/10"
		>
			<ArrowLeft class="h-6 w-6 text-title-text" />
		</a>
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight text-title-text">
				Tulis Artikel / Proker Baru
			</h1>
			<p class="text-sm text-primary-text opacity-80">
				Beri tahu audiens mengenai agenda/kegiatan terbaru HIMATIF.
			</p>
		</div>
	</div>

	<div
		class="glass-card hover-lift mt-2 mb-10 rounded p-6 shadow-sm md:p-8"
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
			<!-- Hidden input pendeteksi status Draft vs Publish -->
			<input type="hidden" name="isPublishing" value={isPublishing.toString()} />

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<FormField
					label="Judul Blog / Proker"
					name="title"
					bind:value={title}
					required
					error={form?.errors?.title}
					placeholder="Contoh: Kunjungan Industri 2026..."
				/>

				<div class="form-control flex flex-col gap-2">
					<label for="slug" class="text-sm font-bold text-primary-text opacity-90"
						>URL Slug <span class="text-red-500">*</span></label
					>
					<input
						type="text"
						id="slug"
						name="slug"
						bind:value={slug}
						oninput={handleSlugInput}
						required
						placeholder="kunjungan-industri-2026"
						class="smooth-transition w-full rounded border bg-background/80 px-4 py-3 text-title-text focus:ring-2 focus:outline-none
                            {form?.errors?.slug
							? 'border-red-500 focus:ring-red-500/50'
							: 'border-primary/20 focus:border-primary focus:ring-primary/50'}"
					/>
					<span class="mt-1 text-xs text-primary-text opacity-60"
						>Akan otomatis digenerate dari Judul. Boleh diubah manual.</span
					>
					{#if form?.errors?.slug}
						<span class="mt-1 text-xs font-semibold text-red-500">{form?.errors?.slug}</span>
					{/if}
				</div>
			</div>

			<div
				class="grid grid-cols-1 gap-6 rounded border border-primary/10 bg-primary/5 p-4 md:grid-cols-2"
			>
				<div class="flex flex-col gap-4">
					<FormField
						type="date"
						label="Tanggal Pelaksanaan / Acara"
						name="date"
						value={initialValues.date}
						required
						error={form?.errors?.date}
					/>
				</div>

				<div class="flex flex-col gap-4">
					<ImageUpload
						name="thumbnailUrl"
						label="Thumbnail / Cover Artikel"
						bind:value={thumbnailUrl}
						folder="himatif/proker"
						previewSize="lg"
						error={form?.errors?.thumbnailUrl}
					/>
				</div>
			</div>

			<div class="mt-2 border-t border-primary/10 pt-6">
				<TextArea
					label="Deskripsi Singkat (Ringkasan)"
					name="description"
					value={initialValues.description}
					rows={3}
					required
					hint="Paragraf pendek yang akan tampil di halaman daftar blog utama."
					error={form?.errors?.description}
				/>
			</div>

			<!-- WYSIWYG Editor (Tiptap) -->
			<div class="mt-4 w-full">
				<RichTextEditor
					name="content"
					value={initialValues.content}
					error={form?.errors?.content}
					label="Konten Utama Artikel (WYSIWYG)"
				/>
			</div>

			<!-- Actions (Dua Submit Button) -->
			<div class="mt-4 flex flex-wrap justify-end gap-3 border-t border-primary/10 pt-6">
				<a
					href="/admin/dashboard/proker"
					class="smooth-transition flex items-center justify-center rounded border border-primary/10 bg-white/50 px-6 py-3 font-bold text-primary-text hover:bg-white/80"
				>
					Batal
				</a>
				<div class="min-w-[20px] flex-1"></div>
				<!-- Simpan Draft -->
				<button
					type="submit"
					onclick={() => (isPublishing = false)}
					disabled={isSubmitting}
					class="btn-cta flex items-center gap-2 rounded-full border border-slate-500 bg-slate-500/10 bg-none px-6 py-3 text-sm text-slate-700 shadow-none hover:transform-none hover:bg-slate-500/20 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
					style="background: transparent; color: var(--color-primary-text);"
				>
					{#if isSubmitting && !isPublishing}
						<span
							class="h-5 w-5 animate-spin rounded-full border-2 border-primary-text/30 border-t-primary-text"
						></span>
						<span>Menyimpan Draft...</span>
					{:else}
						<Save class="h-4 w-4" />
						<span>Simpan sebagai Draft</span>
					{/if}
				</button>
				<!-- Publish Sekarang -->
				<button
					type="submit"
					onclick={() => (isPublishing = true)}
					disabled={isSubmitting}
					class="btn-cta flex items-center gap-2 rounded-full px-8 py-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSubmitting && isPublishing}
						<span class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
						></span>
						<span>Memproses...</span>
					{:else}
						<Send class="h-5 w-5" />
						<span>Publish Sekarang</span>
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
