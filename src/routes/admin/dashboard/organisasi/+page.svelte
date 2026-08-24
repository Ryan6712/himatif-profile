<script lang="ts">
    import { enhance } from "$app/forms";
    import { FormField, TextArea, Toast } from "$lib/components/admin";
    import { Save, Building2 } from "@lucide/svelte";

    let { data, form } = $props();

    // Default values if empty
    const org = data.organization || {
        nama: "",
        namaLengkap: "",
        visi: "",
        misi: "[]",
        tujuan: "",
        logoSmallUrl: "",
        logoBigUrl: ""
    };

    // Use form action return values if available (for validation errors fallback), 
    // otherwise use loaded data
    const initialValues = form?.values || {
        nama: org.nama,
        namaLengkap: org.namaLengkap,
        visi: org.visi,
        misi: parseMisiForTextarea(org.misi),
        tujuan: org.tujuan,
        logoSmallUrl: org.logoSmallUrl,
        logoBigUrl: org.logoBigUrl
    };

    let isSubmitting = $state(false);
    
    // Toast State
    let showToast = $state(false);
    let toastMessage = $state("");
    let toastType = $state<"success" | "error">("success");

    $effect(() => {
        if (form?.success) {
            toastMessage = form.message || "Berhasil disimpan";
            toastType = "success";
            showToast = true;
        } else if (form?.error) {
            toastMessage = form.error;
            toastType = "error";
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
</script>

<Toast 
    visible={showToast} 
    message={toastMessage} 
    type={toastType} 
    onClose={() => showToast = false} 
/>

<div class="flex flex-col stack-lg max-w-4xl">
    <div class="flex items-center gap-4 border-b border-primary/10 pb-4">
        <div class="icon-container rounded">
            <Building2 class="w-6 h-6 text-secondary" />
        </div>
        <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-title-text">Organisasi</h1>
            <p class="text-sm opacity-80 text-primary-text">Ubah identitas, visi, misi, dan tujuan himpunan.</p>
        </div>
    </div>

    <div class="glass-card p-6 md:p-8 rounded hover-lift shadow-sm" style="box-shadow: var(--shadow-card-md);">
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <!-- Nanti di Sprint 6 ini akan diganti dengan ImageUpload component -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded border border-primary/10 bg-primary/5">
                <div class="flex flex-col gap-4">
                    <FormField 
                        label="URL Logo Kecil (Navbar)" 
                        name="logoSmallUrl" 
                        value={initialValues.logoSmallUrl} 
                        required 
                        error={form?.errors?.logoSmallUrl}
                        placeholder="https://..."
                    />
                    {#if initialValues.logoSmallUrl}
                        <div class="w-12 h-12 rounded overflow-hidden border border-white/20 shadow-sm bg-white/50">
                            <img src={initialValues.logoSmallUrl} alt="Logo Kecil" class="w-full h-full object-contain" />
                        </div>
                    {/if}
                </div>

                <div class="flex flex-col gap-4">
                    <FormField 
                        label="URL Logo Besar (Home)" 
                        name="logoBigUrl" 
                        value={initialValues.logoBigUrl} 
                        required 
                        error={form?.errors?.logoBigUrl}
                        placeholder="https://..."
                    />
                    {#if initialValues.logoBigUrl}
                        <div class="w-32 h-32 rounded overflow-hidden border border-white/20 shadow-sm bg-white/50">
                            <img src={initialValues.logoBigUrl} alt="Logo Besar" class="w-full h-full object-cover" />
                        </div>
                    {/if}
                </div>
            </div>

            <div class="border-t border-primary/10 pt-6 mt-2 flex flex-col gap-6">
                <h3 class="text-lg font-bold text-title-text mb-2">Visi, Misi & Tujuan</h3>
                
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

            <div class="flex justify-end pt-4 mt-2">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    class="btn-cta py-3 px-8 text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if isSubmitting}
                        <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Menyimpan...</span>
                    {:else}
                        <Save class="w-5 h-5" />
                        <span>Simpan Perubahan</span>
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>