<script lang="ts">
    import { enhance } from "$app/forms";
    import { FormField, TextArea, Toast } from "$lib/components/admin";
    import { Save, ArrowLeft } from "@lucide/svelte";

    let { form } = $props();

    // Initialize values from form state (fallback for failed submissions)
    const initialValues = form?.values || {
        nama: "",
        namaLengkap: "",
        logoUrl: "",
        thumbnailUrl: "",
        deskripsi: ""
    };

    let isSubmitting = $state(false);
    
    // Toast State
    let showToast = $state(false);
    let toastMessage = $state("");

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
    onClose={() => showToast = false} 
/>

<div class="flex flex-col stack-lg max-w-4xl">
    <div class="flex items-center gap-4 border-b border-primary/10 pb-4">
        <a href="/admin/dashboard/devisi" class="icon-container rounded hover:bg-primary/10 smooth-transition">
            <ArrowLeft class="w-6 h-6 text-title-text" />
        </a>
        <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-title-text">Tambah Divisi Baru</h1>
            <p class="text-sm opacity-80 text-primary-text">Masukkan informasi detail departemen HIMATIF.</p>
        </div>
    </div>

    <div class="glass-card p-6 md:p-8 rounded hover-lift shadow-sm mt-2" style="box-shadow: var(--shadow-card-md);">
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <!-- Nanti di Sprint 6 ini akan diganti dengan ImageUpload component -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded border border-primary/10 bg-primary/5">
                <div class="flex flex-col gap-4">
                    <FormField 
                        label="URL Logo (Icon)" 
                        name="logoUrl" 
                        value={initialValues.logoUrl} 
                        required 
                        error={form?.errors?.logoUrl}
                        placeholder="https://..."
                    />
                    {#if initialValues.logoUrl}
                        <div class="w-16 h-16 rounded overflow-hidden border border-white/20 shadow-sm bg-white/50 p-1 mx-auto">
                            <img src={initialValues.logoUrl} alt="Logo" class="w-full h-full object-contain" />
                        </div>
                    {/if}
                </div>

                <div class="flex flex-col gap-4">
                    <FormField 
                        label="URL Thumbnail (Cover)" 
                        name="thumbnailUrl" 
                        value={initialValues.thumbnailUrl} 
                        error={form?.errors?.thumbnailUrl}
                        placeholder="https://..."
                    />
                    {#if initialValues.thumbnailUrl}
                        <div class="w-full h-32 rounded overflow-hidden border border-white/20 shadow-sm bg-white/50">
                            <img src={initialValues.thumbnailUrl} alt="Thumbnail" class="w-full h-full object-cover" />
                        </div>
                    {/if}
                </div>
            </div>

            <div class="border-t border-primary/10 pt-6 mt-2">
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

            <div class="flex justify-end gap-3 pt-4 mt-2">
                <a 
                    href="/admin/dashboard/devisi"
                    class="px-6 py-3 rounded font-bold text-primary-text bg-white/50 hover:bg-white/80 border border-primary/10 smooth-transition"
                >
                    Batal
                </a>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    class="btn-cta py-3 px-8 text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                >
                    {#if isSubmitting}
                        <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Menyimpan...</span>
                    {:else}
                        <Save class="w-5 h-5" />
                        <span>Simpan Divisi</span>
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>