<script lang="ts">
    import { enhance } from "$app/forms";
    import { Toast, ConfirmDialog } from "$lib/components/admin";
    import { UserRound, Plus, Pencil, Trash2, FilterX, ChevronLeft, ChevronRight } from "@lucide/svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
	import { SvelteURLSearchParams } from "svelte/reactivity";
	import { resolve } from "$app/paths";

    let { data, form } = $props();

    const members = $derived(data.members || []);
    const pagination = $derived(data.pagination);
    const filters = $derived(data.filters);
    const devisiList = $derived(data.devisiList || []);


    // Toast State
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

    // Delete State
    let showDeleteModal = $state(false);
    let deletingId = $state<number | null>(null);
    let deletingName = $state("");
    let isDeleting = $state(false);

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

    // Helper Filter
    function applyFilters() {
        const params = new SvelteURLSearchParams(); //gunakna SvelteURLSearchParams jangan pakai URLSearchParams
        if (filters.search) params.set("search", filters.search);
        if (filters.type) params.set("type", filters.type);
        if (filters.devisiId) params.set("devisi", filters.devisiId);
        params.set("page", "1"); // Reset ke page 1 tiap ganti filter

        goto(resolve(`/admin/dashboard/member?${params.toString()}`)); //gunakan relove dari $app/paths untuk menggunakan goto dan pastikan url nya sesuai
    }

    function resetFilters() {
        filters.search =  "";
        filters.type =  "";
        filters.devisiId = "";
        goto(resolve("/admin/dashboard/member?"));
    }

    // Badge Color Mapping
    const getBadgeStyle = (type: string) => {
        switch (type) {
            case "BPH": return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
            case "KADIV": return "bg-green-500/10 text-green-500 border border-green-500/20";
            case "ALUMNI": return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
            default: return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
        }
    };
</script>

<Toast visible={showToast} message={toastMessage} type={toastType} onClose={() => showToast = false} />

<ConfirmDialog
    title="Hapus Anggota"
    message="Apakah Anda yakin ingin menghapus anggota '{deletingName}'?"
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
                <UserRound class="w-6 h-6 text-secondary" />
            </div>
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-title-text">Kelola Anggota</h1>
                <p class="text-sm opacity-80 text-primary-text">Daftar struktur dan anggota HIMATIF.</p>
            </div>
        </div>
        <a href="/admin/dashboard/member/tambah" class="btn-cta py-2.5 px-5 flex items-center gap-2 text-sm self-start sm:self-auto rounded-full">
            <Plus class="w-4 h-4" />
            <span>Tambah Anggota</span>
        </a>
    </div>

    <!-- Filters -->
    <div class="glass-card rounded p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center ">
        <!-- Search -->
        <div class="relative w-full md:w-auto">
            <input 
                type="text" 
                bind:value={filters.search}
                onkeydown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Cari nama anggota..." 
                class="w-full pl-9 pr-4 py-2 text-sm rounded bg-background/50 border border-primary/10 focus:ring-1 focus:ring-primary/50 outline-none"
            >
        </div>

        <!-- Tipe Dropdown -->
        <select bind:value={filters.type} onchange={applyFilters} class="w-full md:w-40 py-2 px-3 text-sm rounded bg-background/50 border border-primary/10 outline-none">
            <option value="">Semua Tipe</option>
            <option value="BPH">BPH</option>
            <option value="KADIV">KADIV</option>
            <option value="REGULAR">REGULAR</option>
            <option value="ALUMNI">ALUMNI</option>
        </select>

        <!-- Divisi Dropdown -->
        <select bind:value={filters.devisiId} onchange={applyFilters} class="w-full md:w-48 py-2 px-3 text-sm rounded bg-background/50 border border-primary/10 outline-none">
            <option value="">Semua Divisi</option>
            {#each devisiList as dev (dev.id)}
                <option value={dev.id}>{dev.nama}</option>
            {/each}
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
                        <th class="px-6 py-4 w-20 text-center">Foto</th>
                        <th class="px-6 py-4">Informasi Anggota</th>
                        <th class="px-6 py-4 text-center">Tipe</th>
                        <th class="px-6 py-4 text-center">Divisi</th>
                        <th class="px-6 py-4 text-right w-32">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary/10 bg-white/20">
                    {#each members as item, i (item.id)}
                    <tr class="hover:bg-white/40 smooth-transition group">
                        <td class="px-6 py-4 text-center font-semibold opacity-70 text-primary-text">
                            {(pagination.page - 1) * pagination.limit + i + 1}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <div class="w-10 h-10 rounded-full border border-primary/20 mx-auto overflow-hidden bg-white">
                                <img src={item.imageUrl} alt={item.name} class="w-full h-full object-cover" />
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="font-bold text-title-text block">{item.name}</span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="px-3 py-1 text-xs font-bold rounded-full {getBadgeStyle(item.memberType)}">
                                {item.memberType}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center text-sm font-semibold opacity-80">
                            {item.devisi?.nama || "-"}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <a href="/admin/dashboard/member/{item.id}/edit" class="p-2 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded smooth-transition">
                                    <Pencil class="w-4 h-4" />
                                </a>
                                <button type="button" onclick={() => triggerDelete(item.id, item.name)} class="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded smooth-transition">
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    {/each}

                    {#if members.length === 0}
                    <tr>
                        <td colspan="6" class="px-6 py-10 text-center font-semibold opacity-60 text-primary-text bg-white/20">
                            Tidak ada data yang sesuai dengan filter pencarian.
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