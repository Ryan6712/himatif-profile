<script lang="ts">
    import { enhance } from "$app/forms";
    import { FormField, TextArea, Toast, ImageUpload, RichTextEditor } from "$lib/components/admin";
    import { Save, ArrowLeft, Send } from "@lucide/svelte";
    import { generateSlug } from "$lib/utils/slug";

    let { form } = $props();

    const initialValues = form?.values || {
        title: "",
        slug: "",
        date: "",
        thumbnailUrl: "",
        description: "",
        content: ""
    };

    let isSubmitting = $state(false);
    let isPublishing = $state(false); // flag yg menandakan action yg dipilih user
    
    // UI states
    let title = $state(initialValues.title);
    let slug = $state(initialValues.slug);
    let thumbnailUrl = $state(initialValues.thumbnailUrl);
    let slugManuallyEdited = $state(false);

    let showToast = $state(false);
    let toastMessage = $state("");

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

<Toast visible={showToast} message={toastMessage} type="error" onClose={() => showToast = false} />

<div class="flex flex-col stack-lg max-w-4xl mx-auto">
    <div class="flex items-center gap-4 border-b border-primary/10 pb-4">
        <a href="/admin/dashboard/proker" class="icon-container rounded hover:bg-primary/10 smooth-transition">
            <ArrowLeft class="w-6 h-6 text-title-text" />
        </a>
        <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-title-text">Tulis Artikel / Proker Baru</h1>
            <p class="text-sm opacity-80 text-primary-text">Beri tahu audiens mengenai agenda/kegiatan terbaru HIMATIF.</p>
        </div>
    </div>

    <div class="glass-card p-6 md:p-8 rounded hover-lift shadow-sm mt-2 mb-10" style="box-shadow: var(--shadow-card-md);">
        <form method="POST" class="flex flex-col gap-6"
            use:enhance={() => {
                isSubmitting = true;
                showToast = false;
                return async ({ update }) => {
                    await update({ reset: false });
                    isSubmitting = false;
                };
            }}>
            
            <!-- Hidden input pendeteksi status Draft vs Publish -->
            <input type="hidden" name="isPublishing" value={isPublishing.toString()} />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                    label="Judul Blog / Proker" 
                    name="title" 
                    bind:value={title}
                    required 
                    error={form?.errors?.title}
                    placeholder="Contoh: Kunjungan Industri 2026..."
                />
                
                <div class="form-control flex flex-col gap-2">
                    <label for="slug" class="text-sm font-bold text-primary-text opacity-90">URL Slug <span class="text-red-500">*</span></label>
                    <input 
                        type="text" id="slug" name="slug" 
                        bind:value={slug}
                        oninput={handleSlugInput}
                        required 
                        placeholder="kunjungan-industri-2026"
                        class="px-4 py-3 rounded border bg-background/80 text-title-text focus:outline-none focus:ring-2 smooth-transition w-full
                            {form?.errors?.slug ? 'border-red-500 focus:ring-red-500/50' : 'border-primary/20 focus:ring-primary/50 focus:border-primary'}"
                    />
                    <span class="text-xs text-primary-text opacity-60 mt-1">Akan otomatis digenerate dari Judul. Boleh diubah manual.</span>
                    {#if form?.errors?.slug}
                        <span class="text-xs font-semibold text-red-500 mt-1">{form?.errors?.slug}</span>
                    {/if}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded border border-primary/10 bg-primary/5">
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

            <div class="border-t border-primary/10 pt-6 mt-2">
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
            <div class="flex justify-end gap-3 pt-6 mt-4 border-t border-primary/10 flex-wrap">
                <a href="/admin/dashboard/proker" class="px-6 py-3 rounded font-bold text-primary-text bg-white/50 hover:bg-white/80 border border-primary/10 smooth-transition flex items-center justify-center">
                    Batal
                </a>
                <div class="flex-1 min-w-[20px]"></div>
                <!-- Simpan Draft -->
                <button 
                    type="submit" 
                    onclick={() => isPublishing = false}
                    disabled={isSubmitting}
                    class="btn-cta py-3 px-6 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full bg-none bg-slate-500/10 border border-slate-500 text-slate-700 hover:bg-slate-500/20 shadow-none hover:shadow-none hover:transform-none"
                    style="background: transparent; color: var(--color-primary-text);"
                >
                    {#if isSubmitting && !isPublishing}
                        <span class="w-5 h-5 border-2 border-primary-text/30 border-t-primary-text rounded-full animate-spin"></span>
                        <span>Menyimpan Draft...</span>
                    {:else}
                        <Save class="w-4 h-4" />
                        <span>Simpan sebagai Draft</span>
                    {/if}
                </button>
                <!-- Publish Sekarang -->
                <button 
                    type="submit" 
                    onclick={() => isPublishing = true}
                    disabled={isSubmitting}
                    class="btn-cta py-3 px-8 text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                >
                    {#if isSubmitting && isPublishing}
                        <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Memproses...</span>
                    {:else}
                        <Send class="w-5 h-5" />
                        <span>Publish Sekarang</span>
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>