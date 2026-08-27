<script lang="ts">
	import { UploadCloud, Image as ImageIcon, Loader2, X, RefreshCw } from '@lucide/svelte';

	interface Props {
		name: string;
		label?: string;
		value?: string | null;
		folder?: string;
		previewSize?: 'sm' | 'md' | 'lg' | 'long';
		error?: string;
		required?: boolean;
		accept?: string;
	}

	let {
		name,
		label = 'Gambar',
		value = $bindable(''),
		folder = 'himatif/general',
		previewSize = 'md',
		error: errorMsg = '',
		required = false,
		accept = 'image/*'
	}: Props = $props();

	let uploading = $state(false);
	let uploadError = $state('');
	let dragOver = $state(false);
	let fileInput: HTMLInputElement;

	const sizeClasses = {
		sm: 'w-20 h-20',
		md: 'w-32 h-32',
		lg: 'w-48 h-48',
		long: 'w-[215px] h-[35px]'
	};

	async function handleUpload(file: File) {
		uploading = true;
		uploadError = '';

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('folder', folder);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || 'Upload gagal');
			}

			value = result.data.url;
		} catch (err: any) {
			uploadError = err.message || 'Terjadi kesalahan koneksi';
		} finally {
			uploading = false;
			if (fileInput) fileInput.value = ''; // Reset input element
		}
	}

	function onFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) handleUpload(file);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		const file = event.dataTransfer?.files?.[0];
		if (file && file.type.startsWith('image/')) {
			handleUpload(file);
		} else {
			uploadError = 'Mohon masukkan file gambar yang valid.';
		}
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function onDragLeave() {
		dragOver = false;
	}

	function removeImage() {
		value = '';
	}
</script>

<div class="form-control flex flex-col gap-2">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="text-sm font-bold text-primary-text opacity-90">
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</label>

	<!-- Hidden file input for file picker dialog -->
	<input type="file" {accept} bind:this={fileInput} onchange={onFileSelect} class="hidden" />

	<!-- Hidden input to pass value back to SvelteKit form action -->
	<input type="hidden" {name} {value} />

	{#if value}
		<div
			class="smooth-transition flex items-start gap-4 rounded border border-primary/20 bg-background/50 p-4"
		>
			<div
				class="{sizeClasses[
					previewSize
				]} shrink-0 overflow-hidden rounded border border-white/20 bg-white/50 shadow-sm"
			>
				<img
					src={value}
					alt="Preview"
					loading="lazy"
					decoding="async"
					class="h-full w-full object-cover"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<button
					type="button"
					onclick={() => fileInput.click()}
					class="btn-cta flex items-center justify-center gap-2 rounded px-4 py-2 text-sm"
				>
					<RefreshCw class="h-4 w-4" />
					<span>Ganti</span>
				</button>
				<button
					type="button"
					onclick={removeImage}
					class="smooth-transition flex items-center justify-center gap-2 rounded bg-red-500/10 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-500/20"
				>
					<X class="h-4 w-4" />
					<span>Hapus</span>
				</button>
			</div>
		</div>
	{:else}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="smooth-transition flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed p-6 text-center
            {dragOver
				? 'border-primary bg-primary/10'
				: 'border-primary/30 bg-background/50 hover:border-primary/50 hover:bg-primary/5'}
            {uploading ? 'pointer-events-none opacity-70' : ''}"
			ondrop={onDrop}
			ondragover={onDragOver}
			ondragleave={onDragLeave}
			onclick={() => fileInput.click()}
		>
			{#if uploading}
				<div class="flex flex-col items-center gap-2 text-primary">
					<Loader2 class="h-8 w-8 animate-spin" />
					<span class="text-sm font-bold">Mengupload...</span>
				</div>
			{:else}
				<UploadCloud class="mb-3 h-10 w-10 text-secondary/50" />
				<p class="text-sm font-bold tracking-wide text-title-text">
					Tarik & lepaskan file gambar di sini
				</p>
				<p class="mt-1 text-xs font-semibold text-primary-text opacity-60">
					Atau klik untuk memilih file dari komputer
				</p>
				<div class="mt-4 flex gap-2">
					<span
						class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary-text uppercase opacity-70"
						>JPG</span
					>
					<span
						class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary-text uppercase opacity-70"
						>PNG</span
					>
					<span
						class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary-text uppercase opacity-70"
						>WEBP</span
					>
					<span
						class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary-text uppercase opacity-70"
						>MAX 5MB</span
					>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Manual URL fallback if needed (Optional feature just to be safe) -->
	<details class="group mt-1">
		<summary
			class="smooth-transition flex cursor-pointer list-none items-center gap-1 text-xs font-bold text-secondary opacity-70 hover:opacity-100"
		>
			<ImageIcon class="h-3 w-3" />
			<span>Atau masukkan URL gambar secara manual</span>
		</summary>
		<input
			type="url"
			bind:value
			placeholder="https://example.com/image.jpg"
			class="mt-2 w-full rounded border border-primary/20 bg-background/80 px-3 py-2 text-sm focus:ring-1 focus:ring-primary/50 focus:outline-none"
		/>
	</details>

	{#if uploadError}
		<span class="mt-1 text-xs font-semibold text-red-500">{uploadError}</span>
	{/if}
	{#if errorMsg}
		<span class="mt-1 text-xs font-semibold text-red-500">{errorMsg}</span>
	{/if}
</div>
