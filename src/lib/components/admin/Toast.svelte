<script lang="ts">
    import { fly } from "svelte/transition";
    import { CheckCircle2, XCircle, Info, X } from "@lucide/svelte";
  
    interface Props {
      message: string;
      type?: "success" | "error" | "info";
      visible: boolean;
      duration?: number;
      onClose: () => void;
    }
  
    let { 
        message, 
        type = "success", 
        visible = false,
        duration = 3000,
        onClose
    }: Props = $props();
  
    $effect(() => {
        if (visible && duration > 0) {
            const timer = setTimeout(() => { 
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    });

    // Style map based on type
    const styleMap = {
        success: "bg-green-500/10 border-green-500/20 text-green-700",
        error: "bg-red-500/10 border-red-500/20 text-red-700",
        info: "bg-blue-500/10 border-blue-500/20 text-blue-700"
    };

    const IconMap = {
        success: CheckCircle2,
        error: XCircle,
        info: Info
    };
</script>
  
{#if visible}
    {@const Icon = IconMap[type]} <!--ingat @const harus tidak terhalang oleh apapun itu-->
    <div 
        class="fixed top-20 right-4 z-50 flex items-start gap-3 p-4 rounded border shadow-lg backdrop-blur-md min-w-75 {styleMap[type]}" 
        transition:fly={{ y: -20, duration: 300 }}
    >
        <Icon class="w-5 h-5 shrink-0 mt-0.5" />
        
        <p class="font-semibold text-sm flex-1">{message}</p>
        
        <button onclick={onClose} class="opacity-60 hover:opacity-100 transition-opacity p-0.5">
            <X class="w-4 h-4" />
        </button>
    </div>
{/if}