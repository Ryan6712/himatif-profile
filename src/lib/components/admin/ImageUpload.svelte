<script lang="ts">
    import { UploadCloud, Image as ImageIcon, Loader2, X, RefreshCw } from "@lucide/svelte";

    interface Props {
      name: string;
      label?: string;
      value?: string;
      folder?: string;
      previewSize?: "sm" | "md" | "lg" | "long";
      error?: string;
      required?: boolean;
      accept?: string;
    }
  
    let {
      name,
      label = "Gambar",
      value = $bindable(""),
      folder = "himatif/general",
      previewSize = "md",
      error: errorMsg = "",
      required = false,
      accept = "image/*",
    }: Props = $props();
  
    let uploading = $state(false);
    let uploadError = $state("");
    let dragOver = $state(false);
    let fileInput: HTMLInputElement;
  
    const sizeClasses = {
      sm: "w-20 h-20",
      md: "w-32 h-32",
      lg: "w-48 h-48",
      long: "w-[215px] h-[35px]"
    };
  
    async function handleUpload(file: File) {
      uploading = true;
      uploadError = "";
  
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
  
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Upload gagal");
        }
  
        value = result.data.url;
      } catch (err: any) {
        uploadError = err.message || "Terjadi kesalahan koneksi";
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
      if (file && file.type.startsWith("image/")) {
        handleUpload(file);
      } else {
        uploadError = "Mohon masukkan file gambar yang valid.";
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
      value = "";
    }
</script>
  
<div class="form-control flex flex-col gap-2">
    <label class="text-sm font-bold text-primary-text opacity-90">
        {label}
        {#if required}
            <span class="text-red-500">*</span>
        {/if}
    </label>
  
    <!-- Hidden file input for file picker dialog -->
    <input
      type="file"
      {accept}
      bind:this={fileInput}
      onchange={onFileSelect}
      class="hidden"
    />
  
    <!-- Hidden input to pass value back to SvelteKit form action -->
    <input type="hidden" {name} {value} />
  
    {#if value}
        <div class="flex items-start gap-4 p-4 border border-primary/20 bg-background/50 rounded smooth-transition">
            <div class="{sizeClasses[previewSize]} shrink-0 rounded overflow-hidden shadow-sm bg-white/50 border border-white/20">
                <img src={value} alt="Preview" loading="lazy" decoding="async" class="w-full h-full object-cover" />
            </div>
            <div class="flex flex-col gap-2">
                <button 
                    type="button" 
                    onclick={() => fileInput.click()} 
                    class="btn-cta py-2 px-4 rounded text-sm flex items-center justify-center gap-2"
                >
                    <RefreshCw class="w-4 h-4" />
                    <span>Ganti</span>
                </button>
                <button 
                    type="button" 
                    onclick={removeImage} 
                    class="py-2 px-4 rounded font-bold text-sm bg-red-500/10 text-red-600 hover:bg-red-500/20 smooth-transition flex items-center justify-center gap-2"
                >
                    <X class="w-4 h-4" />
                    <span>Hapus</span>
                </button>
            </div>
        </div>
    {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="border-2 border-dashed rounded p-6 flex flex-col items-center justify-center text-center cursor-pointer smooth-transition min-h-[140px]
            {dragOver ? 'border-primary bg-primary/10' : 'border-primary/30 bg-background/50 hover:border-primary/50 hover:bg-primary/5'}
            {uploading ? 'opacity-70 pointer-events-none' : ''}"
            ondrop={onDrop}
            ondragover={onDragOver}
            ondragleave={onDragLeave}
            onclick={() => fileInput.click()}
        >
            {#if uploading}
                <div class="flex flex-col items-center gap-2 text-primary">
                    <Loader2 class="w-8 h-8 animate-spin" />
                    <span class="text-sm font-bold">Mengupload...</span>
                </div>
            {:else}
                <UploadCloud class="w-10 h-10 text-secondary/50 mb-3" />
                <p class="text-sm font-bold text-title-text tracking-wide">Tarik & lepaskan file gambar di sini</p>
                <p class="text-xs font-semibold text-primary-text opacity-60 mt-1">Atau klik untuk memilih file dari komputer</p>
                <div class="flex gap-2 mt-4">
                    <span class="px-2 py-0.5 rounded bg-primary/10 text-primary-text opacity-70 text-[10px] font-bold uppercase">JPG</span>
                    <span class="px-2 py-0.5 rounded bg-primary/10 text-primary-text opacity-70 text-[10px] font-bold uppercase">PNG</span>
                    <span class="px-2 py-0.5 rounded bg-primary/10 text-primary-text opacity-70 text-[10px] font-bold uppercase">WEBP</span>
                    <span class="px-2 py-0.5 rounded bg-primary/10 text-primary-text opacity-70 text-[10px] font-bold uppercase">MAX 5MB</span>
                </div>
            {/if}
        </div>
    {/if}
  
    <!-- Manual URL fallback if needed (Optional feature just to be safe) -->
    <details class="mt-1 group">
      <summary class="text-xs font-bold text-secondary cursor-pointer opacity-70 hover:opacity-100 smooth-transition list-none flex items-center gap-1">
        <ImageIcon class="w-3 h-3" /> 
        <span>Atau masukkan URL gambar secara manual</span>
      </summary>
      <input
        type="url"
        bind:value
        placeholder="https://example.com/image.jpg"
        class="mt-2 w-full px-3 py-2 text-sm rounded border border-primary/20 bg-background/80 focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
    </details>
  
    {#if uploadError}
      <span class="text-xs font-semibold text-red-500 mt-1">{uploadError}</span>
    {/if}
    {#if errorMsg}
      <span class="text-xs font-semibold text-red-500 mt-1">{errorMsg}</span>
    {/if}
</div>