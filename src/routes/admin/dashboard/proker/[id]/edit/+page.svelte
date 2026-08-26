<script lang="ts">
    import { enhance } from "$app/forms";
    import { FormField, TextArea, Toast, ImageUpload, RichTextEditor } from "$lib/components/admin";
    import { Save, ArrowLeft, Send, XCircle } from "@lucide/svelte";
    import { generateSlug } from "$lib/utils/slug";

    let { data, form } = $props();

    const currentProker = data.proker;

    // Untuk initial value form kita prioritaskan fallback dari form (bila submit gagal), bila tidak ada baru load dari DB
    const initialValues = form?.values || {
        title: currentProker.title,
        slug: currentProker.slug,
        date: new Date(currentProker.date).toISOString().split('T')[0], // format yyyy-mm-dd untuk input date HTML
        thumbnailUrl: currentProker.thumbnailUrl || "",
        description: currentProker.description,
        content: currentProker.content
    };

    let isSubmitting = $state(false);
    // Menyimpan aksi apa yang dituju user pada tombol untuk memandu controller Server kita
    let publishAction = $state<"publish" | "unpublish" | "save-draft" | "save-published">("save-draft");
    
    let title = $state(initialValues.title);
    let slug = $state(initialValues.slug);
    let thumbnailUrl = $state(initialValues.thumbnailUrl);
    
    // Karena ini halaman edit, slug tidak otomatis direplace kecuali dikosongkan secara manual, jadi manualEdited kita set True sejak awal
    let slugManuallyEdited = $state(true);

    let showToast = $state(false);
    let toastMessage = $state("");

    $effect(() => {
        if (form?.error) {
            toastMessage = form.error;
            showToast = true;
        }
    });

    $effect(() => {
        if (!slugManuallyEdited && title) {
            slug = generateSlug(title);
        }
    });

    function handleSlugInput(e: Event) {
        slugManuallyEdited = true;
        const target = e.target as HTMLInputElement;
        // Jika user mengosongkan lagi slug nya, maka mode autogenerate jalan kembali
        if(target.value.trim() === "") {
            slugManuallyEdited = false;
        }
    }
</script>

<Toast visible={showToast} message={toastMessage} type="error" onClose={() => showToast = false} />

<div class="flex flex-col stack-lg max-w-4xl mx-auto">
    <div class="flex items-center gap-3 border-b border-primary/10 pb-4">
        <a href="/admin/dashboard/proker" class="icon-container rounded hover:bg-primary/10 smooth-transition">
            <ArrowLeft class="w-6 h-6 text-title-text" />
        </a>
        <div class="flex flex-col gap-1 w-full sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-title-text">Edit <span class="gradient-text">{currentProker.title}</span></h1>
                <p class="text-sm opacity-80 text-primary-text">Ubah draf atau konten artikel yang sudah tayang.</p>
            </div>
            
            <div class="mt-2 sm:mt-0">
                {#if currentProker.publishedAt}
                    <span class="px-3 py-1.5 text-xs font-bold bg-green-500/20 text-green-700 rounded border border-green-500/30">
                        Status: PUBLISHED
                    </span>
                {:else}
                    <span class="px-3 py-1.5 text-xs font-bold bg-amber-500/20 text-amber-700 rounded border border-amber-500/30">
                        Status: DRAFT
                    </span>
                {/if}
            </div>
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
            
            <!-- Mengirim tindakan eksplisit -->
            <input type="hidden" name="publishAction" value={publishAction} />

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
                    <span class="text-xs text-primary-text opacity-60 mt-1">URL publik. Kosongkan untuk men-generate ulang berdasar judul.</span>
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

            <div class="mt-4 w-full">
                <RichTextEditor 
                    name="content"
                    value={initialValues.content}
                    error={form?.errors?.content}
                    label="Konten Utama Artikel (WYSIWYG)"
                />
            </div>

            <!-- Area Action Buttons (Conditional berdasarkan Status saat ini) -->
            <div class="flex justify-end gap-3 pt-6 mt-4 border-t border-primary/10 flex-wrap">
                <a href="/admin/dashboard/proker" class="px-6 py-3 rounded font-bold text-primary-text bg-white/50 hover:bg-white/80 border border-primary/10 smooth-transition flex items-center justify-center">
                    Batal
                </a>
                
                <div class="flex-1 min-w-[10px]"></div>
                
                {#if currentProker.publishedAt}
                    <!-- Artikel SUDAH Tayang -->
                    <button 
                        type="submit" 
                        onclick={() => publishAction = "unpublish"}
                        disabled={isSubmitting}
                        class="btn-cta py-3 px-6 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full border border-orange-500 text-orange-700 bg-orange-500/10 hover:bg-orange-500/20 shadow-none hover:shadow-none hover:transform-none"
                        style="background: transparent; box-shadow: none;"
                    >
                        <XCircle class="w-4 h-4" />
                        <span>Unpublish (Tarik Draft)</span>
                    </button>

                    <button 
                        type="submit" 
                        onclick={() => publishAction = "save-published"}
                        disabled={isSubmitting}
                        class="btn-cta py-3 px-8 text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                    >
                        {#if isSubmitting && publishAction === "save-published"}
                            <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Menyimpan...</span>
                        {:else}
                            <Save class="w-5 h-5" />
                            <span>Simpan Pembaruan</span>
                        {/if}
                    </button>

                {:else}
                    <!-- Artikel MASIH DRAF -->
                    <button 
                        type="submit" 
                        onclick={() => publishAction = "save-draft"}
                        disabled={isSubmitting}
                        class="btn-cta py-3 px-6 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full bg-none bg-slate-500/10 border border-slate-500 text-slate-700 hover:bg-slate-500/20 shadow-none hover:shadow-none hover:transform-none"
                        style="background: transparent; color: var(--color-primary-text); box-shadow: none;"
                    >
                        {#if isSubmitting && publishAction === "save-draft"}
                            <span class="w-4 h-4 border-2 border-primary-text/30 border-t-primary-text rounded-full animate-spin"></span>
                        {:else}
                            <Save class="w-4 h-4" />
                        {/if}
                        <span>Simpan Draft</span>
                    </button>

                    <button 
                        type="submit" 
                        onclick={() => publishAction = "publish"}
                        disabled={isSubmitting}
                        class="btn-cta py-3 px-8 text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                    >
                        {#if isSubmitting && publishAction === "publish"}
                            <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Memproses...</span>
                        {:else}
                            <Send class="w-5 h-5" />
                            <span>Publish Sekarang</span>
                        {/if}
                    </button>
                {/if}
            </div>
        </form>
    </div>
</div>