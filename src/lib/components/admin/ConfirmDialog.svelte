<script lang="ts">
	import { AlertTriangle } from '@lucide/svelte';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		title?: string;
		message: string;
		visible: boolean;
		isLoading?: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		title = 'Konfirmasi Hapus',
		message,
		visible = false,
		isLoading = false,
		onConfirm,
		onCancel
	}: Props = $props();
</script>

{#if visible}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
		onclick={onCancel}
		transition:fade={{ duration: 200 }}
	>
		<!-- Modal Card -->
		<div
			class="relative z-10 flex w-full max-w-md flex-col gap-5 rounded border border-primary/20 bg-primary/70 p-6 shadow-2xl md:p-8"
			onclick={(e) => e.stopPropagation()}
			transition:scale={{ start: 0.95, duration: 200 }}
		>
			<div class="flex items-start gap-4">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500"
				>
					<AlertTriangle class="h-6 w-6" />
				</div>
				<div class="mt-1 flex flex-col gap-2">
					<h3 class="text-xl font-bold tracking-tight text-title-text">{title}</h3>
					<p class="text-sm leading-relaxed text-primary-text opacity-80">{message}</p>
				</div>
			</div>

			<div class="mt-2 flex items-center justify-end gap-3">
				<button
					type="button"
					onclick={onCancel}
					disabled={isLoading}
					class="smooth-transition rounded border border-primary/10 bg-white/50 px-5 py-2.5 font-bold text-primary-text hover:bg-white/80 disabled:opacity-50"
				>
					Batal
				</button>
				<button
					type="button"
					onclick={onConfirm}
					disabled={isLoading}
					class="smooth-transition flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 font-bold text-white shadow-md hover:bg-red-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isLoading}
						<span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
						></span>
						<span>Menghapus...</span>
					{:else}
						<span>Hapus</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
