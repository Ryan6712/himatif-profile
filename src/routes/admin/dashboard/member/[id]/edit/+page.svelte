<script lang="ts">
    import { enhance } from "$app/forms";
    import { FormField, Toast, ImageUpload } from "$lib/components/admin";
    import { Save, ArrowLeft, Image as ImageIcon } from "@lucide/svelte";

    let { data, form } = $props();

    const devisiList = data.devisiList;
    const currentMember = data.member;

    const initialValues = form?.values || {
        name: currentMember.name,
        imageUrl: currentMember.imageUrl,
        memberType: currentMember.memberType,
        devisiId: currentMember.devisiId?.toString() || ""
    };

    let isSubmitting = $state(false);
    let selectedType = $state(initialValues.memberType);
    let imageUrl = $state(initialValues.imageUrl);
    
    // Auto disable devisi for BPH & ALUMNI
    let isDevisiDisabled = $derived(selectedType === "BPH" || selectedType === "ALUMNI");

    let showToast = $state(false);
    let toastMessage = $state("");

    $effect(() => {
        if (form?.error) {
            toastMessage = form.error;
            showToast = true;
        }
    });
</script>

<Toast visible={showToast} message={toastMessage} type="error" onClose={() => showToast = false} />

<div class="flex flex-col stack-lg max-w-4xl">
    <div class="flex items-center gap-4 border-b border-primary/10 pb-4">
        <a href="/admin/dashboard/member" class="icon-container rounded hover:bg-primary/10 smooth-transition">
            <ArrowLeft class="w-6 h-6 text-title-text" />
        </a>
        <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-title-text">Edit Anggota <span class="gradient-text">{currentMember.name}</span></h1>
            <p class="text-sm opacity-80 text-primary-text">Ubah informasi, posisi, atau divisi anggota.</p>
        </div>
    </div>

    <div class="glass-card p-6 md:p-8 rounded hover-lift shadow-sm mt-2" style="box-shadow: var(--shadow-card-md);">
        <form method="POST" class="flex flex-col gap-6"
            use:enhance={() => {
                isSubmitting = true;
                showToast = false;
                return async ({ update }) => {
                    await update({ reset: false });
                    isSubmitting = false;
                };
            }}>
            
            <FormField label="Nama Lengkap" name="name" value={initialValues.name} required error={form?.errors?.name} placeholder="Nama Anggota" />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Dropdown Tipe -->
                <div class="form-control flex flex-col gap-2">
                    <label for="memberType" class="text-sm font-bold text-primary-text opacity-90">Tipe Anggota <span class="text-red-500">*</span></label>
                    <select 
                        id="memberType" name="memberType" bind:value={selectedType} required
                        class="px-4 py-3 rounded border border-primary/20 bg-background/80 text-title-text focus:outline-none focus:ring-2 focus:ring-primary/50 smooth-transition w-full"
                    >
                        <option value="REGULAR">Anggota Biasa (REGULAR)</option>
                        <option value="KADIV">Ketua Divisi (KADIV)</option>
                        <option value="BPH">Badan Pengurus Harian (BPH)</option>
                        <option value="ALUMNI">Alumni</option>
                    </select>
                </div>

                <!-- Dropdown Divisi -->
                <div class="form-control flex flex-col gap-2">
                    <label for="devisiId" class="text-sm font-bold text-primary-text opacity-90" class:opacity-50={isDevisiDisabled}>
                        Divisi
                    </label>
                    <select 
                        id="devisiId" name="devisiId" disabled={isDevisiDisabled} value={initialValues.devisiId}
                        class="px-4 py-3 rounded border border-primary/20 bg-background/80 text-title-text focus:outline-none focus:ring-2 focus:ring-primary/50 smooth-transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">-- Pilih Divisi --</option>
                        {#each devisiList as dev}
                            <option value={dev.id}>{dev.nama}</option>
                        {/each}
                    </select>
                    {#if isDevisiDisabled}
                        <span class="text-xs opacity-60 text-primary-text mt-1">BPH & Alumni tidak terikat pada divisi khusus.</span>
                    {/if}
                </div>
            </div>

            <!-- URL Foto -->
            <div class="flex flex-col md:flex-row gap-6 p-4 rounded border border-primary/10 bg-primary/5">
                <div class="flex-1 flex flex-col justify-center gap-4">
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
            <div class="flex justify-end gap-3 pt-4 mt-2 border-t border-primary/10">
                <a href="/admin/dashboard/member" class="px-6 py-3 rounded font-bold text-primary-text bg-white/50 hover:bg-white/80 border border-primary/10 smooth-transition">Batal</a>
                <button type="submit" disabled={isSubmitting} class="btn-cta py-3 px-8 text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full">
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