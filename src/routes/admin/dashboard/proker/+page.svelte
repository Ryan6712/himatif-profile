<script lang="ts">
    import { enhance } from "$app/forms";
    import { Toast, ConfirmDialog } from "$lib/components/admin";
    import { Newspaper, Plus, Pencil, Trash2, Search, FilterX, ChevronLeft, ChevronRight, Eye, ToggleLeft, ToggleRight } from "@lucide/svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
	import { SvelteURLSearchParams } from "svelte/reactivity";
    import { resolve } from "$app/paths";

    let { data, form } = $props();

    const prokerList = $derived(data.prokerList || []);
    const pagination = $derived(data.pagination);
    const filters = $derived(data.filters);

    let searchInput = $state(filters.search);
    let selectedStatus = $state(filters.status);

    let showToast = $state(false);
    let toastMessage = $state("");
    let toastType = $state<"success" | "error">("success");

    $effect(() => {
        if (form?.success) {
            toastMessage = form.message || "Berhasil";
            toastType = "success";
            showToast = true;
        } else if (form?.error) {
            toastMessage = form.error;
            toastType = "error";
            showToast = true;
        }
    });

    let showDeleteModal = $state(false);
    let deletingId = $state<number | null>(null);
    let deletingName = $state("");
    let isDeleting = $state(false);
    let isToggling = $state(false); // Untuk status loading toggle publish

    function triggerDelete(id: number, nama: string) {
        deletingId = id;
        deletingName = nama;
        showDeleteModal = true;
    }

    let deleteForm: HTMLFormElement;
    function confirmDelete() {
        if (deleteForm && deletingId) {
            deleteForm.requestSubmit();
        }
    }

     function getPageUrl(targetPage: number) {
        const params = new SvelteURLSearchParams(page.url.searchParams);
        params.set('page', String(targetPage));
        return `?${params.toString()}`;
    }


    function applyFilters() {
        const params = new SvelteURLSearchParams(); // selalu pakai SvelteURLSearchParams
        if (searchInput) params.set("search", searchInput);
        if (selectedStatus) params.set("status", selectedStatus);
        params.set("page", "1"); 
        goto(resolve(`/admin/dashboard/proker?${params.toString()}`)); // kalau pakai goto selalu call dengan resolve $app/path
    }

    function resetFilters() {
        searchInput = "";
        selectedStatus = "";
        goto(resolve(`/admin/dashboard/proker?`));  // kalau pakai goto selalu call dengan resolve $app/path
    }

    function formatDate(dateStr: Date | string | null) {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }

</script>

<Toast visible={showToast} message={toastMessage} type={toastType} onClose={() => showToast = false} />

<ConfirmDialog
    title="Hapus Program Kerja"
    message="Apakah Anda yakin ingin menghapus artikel '{deletingName}'? Aksi ini tidak dapat dibatalkan."
    visible={showDeleteModal}
    isLoading={isDeleting}
    onCancel={() => { showDeleteModal = false; deletingId = null; }}
    onConfirm={confirmDelete}
/>

<form method="POST" action="?/delete" bind:this={deleteForm} class="hidden"
    use:enhance={() => {
        isDeleting = true;
        return async ({ update }) => {
            await update();
            isDeleting = false;
            showDeleteModal = false;
            deletingId = null;
        };
    }}>
    <input type="hidden" name="id" value={deletingId} />
</form>

<div class="flex flex-col stack-lg">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
        <div class="flex items-center gap-4">
            <div class="icon-container rounded">
                <Newspaper class="w-6 h-6 text-secondary" />
            </div>
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-title-text">Program Kerja (Blog)</h1>
                <p class="text-sm opacity-80 text-primary-text">Kelola artikel kegiatan himpunan.</p>
            </div>
        </div>
        <a href="/admin/dashboard/proker/tambah" class="btn-cta py-2.5 px-5 flex items-center gap-2 text-sm self-start sm:self-auto rounded-full">
            <Plus class="w-4 h-4" />
            <span>Tulis Artikel Baru</span>
        </a>
    </div>

    <!-- Filters -->
    <div class="glass-card rounded p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <!-- Search -->
        <div class="relative w-full md:w-auto flex-1">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input 
                type="text" 
                bind:value={searchInput}
                onkeydown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Cari judul..." 
                class="w-full pl-9 pr-4 py-2 text-sm rounded bg-background/50 border border-primary/10 focus:ring-1 focus:ring-primary/50 outline-none"
            >
        </div>

        <!-- Tipe Dropdown -->
        <select bind:value={selectedStatus} onchange={applyFilters} class="w-full md:w-40 py-2 px-3 text-sm rounded bg-background/50 border border-primary/10 outline-none">
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
        </select>

        <button onclick={resetFilters} class="p-2.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 smooth-transition" title="Reset Filter">
            <FilterX class="w-4 h-4" />
        </button>
    </div>

    <!-- Table -->
    <div class="glass-card rounded flex flex-col overflow-hidden hover-lift shadow-sm mt-2" style="box-shadow: var(--shadow-card-md);">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 text-sm uppercase tracking-wider text-secondary font-bold">
                        <th class="px-6 py-4 w-16 text-center">No</th>
                        <th class="px-6 py-4">Informasi Artikel</th>
                        <th class="px-6 py-4 text-center">Tanggal Acara</th>
                        <th class="px-6 py-4 text-center">Status</th>
                        <th class="px-6 py-4 text-right w-44">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary/10 bg-white/20">
                    {#each prokerList as item, i (item.id)}
                    <tr class="hover:bg-white/40 smooth-transition group">
                        <td class="px-6 py-4 text-center font-semibold opacity-70 text-primary-text">
                            {(pagination.page - 1) * pagination.limit + i + 1}
                        </td>
                        <td class="px-6 py-4">
                            <span class="font-bold text-title-text block truncate max-w-sm" title={item.title}>{item.title}</span>
                            <span class="text-xs opacity-60 text-primary-text block mt-1">/{item.slug}</span>
                        </td>
                        <td class="px-6 py-4 text-center text-sm font-semibold opacity-80">
                            {formatDate(item.date)}
                        </td>
                        <td class="px-6 py-4 text-center">
                            {#if item.publishedAt}
                                <span class="px-3 py-1 text-xs font-bold bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
                                    Published
                                </span>
                            {:else}
                                <span class="px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
                                    Draft
                                </span>
                            {/if}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <!-- Preview Public Link -->
                                {#if item.publishedAt}
                                <a href="/proker/{item.slug}" target="_blank" class="p-2 text-slate-500 bg-slate-500/10 hover:bg-slate-500/20 rounded smooth-transition" title="Preview Public">
                                    <Eye class="w-4 h-4" />
                                </a>
                                {/if}

                                <!-- Toggle Status Form Action -->
                                <form method="POST" action="?/togglePublish" class="inline" use:enhance={() => {
                                    isToggling = true;
                                    return async ({ update }) => {
                                        await update();
                                        isToggling = false;
                                    };
                                }}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <button type="submit" disabled={isToggling} class="p-2 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 rounded smooth-transition disabled:opacity-50" title={item.publishedAt ? 'Batalkan Publish (Jadikan Draft)' : 'Publish Sekarang'}>
                                        {#if item.publishedAt}
                                            <ToggleRight class="w-4 h-4" />
                                        {:else}
                                            <ToggleLeft class="w-4 h-4" />
                                        {/if}
                                    </button>
                                </form>

                                <!-- Edit -->
                                <a href="/admin/dashboard/proker/{item.id}/edit" class="p-2 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded smooth-transition" title="Edit">
                                    <Pencil class="w-4 h-4" />
                                </a>

                                <!-- Delete -->
                                <button type="button" onclick={() => triggerDelete(item.id, item.title)} class="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded smooth-transition" title="Hapus">
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    {/each}

                    {#if prokerList.length === 0}
                    <tr>
                        <td colspan="5" class="px-6 py-10 text-center font-semibold opacity-60 text-primary-text bg-white/20">
                            Tidak ada data program kerja/blog yang sesuai.
                        </td>
                    </tr>
                    {/if}
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        {#if pagination.totalPages > 1}
        <div class="p-4 border-t border-primary/10 flex items-center justify-between bg-white/30 text-sm">
            <span class="opacity-70">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} - 
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} 
                dari {pagination.totalCount}
            </span>

            <div class="flex gap-2">
                
                <a 
                    href="{getPageUrl(pagination.page - 1)}"
                    class="p-2 rounded bg-background border border-primary/10 hover:bg-primary/10 smooth-transition"
                    class:opacity-50={pagination.page <= 1}
                    class:pointer-events-none={pagination.page <= 1}
                >
                    <ChevronLeft class="w-4 h-4" />
                </a>
                
                <a 
                    href="{getPageUrl(pagination.page + 1)}"
                    class="p-2 rounded bg-background border border-primary/10 hover:bg-primary/10 smooth-transition"
                    class:opacity-50={pagination.page >= pagination.totalPages}
                    class:pointer-events-none={pagination.page >= pagination.totalPages}
                >
                    <ChevronRight class="w-4 h-4" />
                </a>
            </div>
        </div>
        {/if}
    </div>
</div>