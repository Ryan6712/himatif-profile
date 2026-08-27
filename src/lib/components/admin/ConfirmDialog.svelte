<script lang="ts">
    import { AlertTriangle } from "@lucide/svelte";
    import { fade, scale } from "svelte/transition";

    interface Props {
      title?: string;
      message: string;
      visible: boolean;
      isLoading?: boolean;
      onConfirm: () => void;
      onCancel: () => void;
    }
  
    let { 
        title = "Konfirmasi Hapus", 
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
        class="fixed inset-0  bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onclick={onCancel}
        transition:fade={{ duration: 200 }}
    >
        <!-- Modal Card -->
        <div 
            class="bg-primary/70 rounded p-6 md:p-8 w-full max-w-md relative z-10 flex flex-col gap-5 border border-primary/20 shadow-2xl" 
            onclick={(e) => e.stopPropagation()}
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <AlertTriangle class="w-6 h-6" />
                </div>
                <div class="flex flex-col gap-2 mt-1">
                    <h3 class="text-xl font-bold text-title-text tracking-tight">{title}</h3>
                    <p class="text-sm opacity-80 text-primary-text leading-relaxed">{message}</p>
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-2">
                <button 
                    type="button" 
                    onclick={onCancel} 
                    disabled={isLoading}
                    class="px-5 py-2.5 rounded font-bold text-primary-text bg-white/50 hover:bg-white/80 border border-primary/10 smooth-transition disabled:opacity-50"
                >
                    Batal
                </button>
                <button 
                    type="button" 
                    onclick={onConfirm} 
                    disabled={isLoading}
                    class="px-5 py-2.5 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg smooth-transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if isLoading}
                        <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Menghapus...</span>
                    {:else}
                        <span>Hapus</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}