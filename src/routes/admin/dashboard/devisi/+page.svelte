<script lang="ts">
    import { enhance } from "$app/forms";
    import { Toast, ConfirmDialog } from "$lib/components/admin";
    import { Users, Plus, Pencil, Trash2 } from "@lucide/svelte";

    let { data, form } = $props();
    
    // Derived state untuk divisiList agar reaktif jika load berubah
    const divisiList = $derived(data.divisiList || []);

    // State untuk Toast Notifikasi
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

    // State untuk Confirm Dialog Delete
    let showDeleteModal = $state(false);
    let deletingId = $state<number | null>(null);
    let deletingName = $state("");
    let isDeleting = $state(false);

    function triggerDelete(id: number, nama: string) {
        deletingId = id;
        deletingName = nama;
        showDeleteModal = true;
    }

    // Submit form tersembunyi secara programatik
    let deleteForm: HTMLFormElement;
    function confirmDelete() {
        if (deleteForm && deletingId) {
            deleteForm.requestSubmit();
        }
    }
</script>

<Toast 
    visible={showToast} 
    message={toastMessage} 
    type={toastType} 
    onClose={() => showToast = false} 
/>

<ConfirmDialog
    title="Hapus Divisi"
    message="Apakah Anda yakin ingin menghapus divisi '{deletingName}'? Semua anggota dalam divisi ini akan menjadi tanpa divisi (Unassigned)."
    visible={showDeleteModal}
    isLoading={isDeleting}
    onCancel={() => {
        showDeleteModal = false;
        deletingId = null;
    }}
    onConfirm={confirmDelete}
/>

<!-- Form tersembunyi untuk delete request via enhance -->
<form 
    method="POST" 
    action="?/delete" 
    bind:this={deleteForm}
    use:enhance={() => {
        isDeleting = true;
        return async ({ update }) => {
            await update();
            isDeleting = false;
            showDeleteModal = false;
            deletingId = null;
        };
    }}
    class="hidden"
>
    <input type="hidden" name="id" value={deletingId} />
</form>

<div class="flex flex-col stack-lg">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
        <div class="flex items-center gap-4">
            <div class="icon-container rounded">
                <Users class="w-6 h-6 text-secondary" />
            </div>
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-title-text">Kelola Divisi</h1>
                <p class="text-sm opacity-80 text-primary-text">Daftar divisi/departemen dalam HIMATIF.</p>
            </div>
        </div>
        <a href="/admin/dashboard/devisi/tambah" class="btn-cta py-2.5 px-5 flex items-center gap-2 text-sm self-start sm:self-auto rounded-full">
            <Plus class="w-4 h-4" />
            <span>Tambah Divisi</span>
        </a>
    </div>

    <!-- Table Card -->
    <div class="glass-card rounded flex flex-col overflow-hidden hover-lift shadow-sm mt-2" style="box-shadow: var(--shadow-card-md);">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 text-sm uppercase tracking-wider text-secondary font-bold">
                        <th class="px-6 py-4 w-16 text-center">No</th>
                        <th class="px-6 py-4 w-20 text-center">Logo</th>
                        <th class="px-6 py-4">Informasi Divisi</th>
                        <th class="px-6 py-4 text-center">Anggota</th>
                        <th class="px-6 py-4 text-right w-32">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary/10 bg-white/20">
                    {#each divisiList as item, i (item.id)}
                    <tr class="hover:bg-white/40 smooth-transition group">
                        <td class="px-6 py-4 text-center font-semibold opacity-70 text-primary-text">
                            {i + 1}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <div class="w-10 h-10 rounded bg-white/50 border border-primary/20 p-1 mx-auto overflow-hidden">
                                <img src={item.logoUrl} alt="Logo" class="w-full h-full object-contain" />
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="font-bold text-title-text text-base block">{item.nama}</span>
                            <span class="text-sm opacity-70 text-primary-text block mt-0.5">{item.namaLengkap}</span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="px-3 py-1 bg-secondary/10 text-secondary font-bold rounded-full border border-secondary/20 text-sm">
                                {item._count.member}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <a 
                                    href="/admin/dashboard/devisi/{item.id}/edit" 
                                    class="p-2 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded smooth-transition"
                                    title="Edit"
                                >
                                    <Pencil class="w-4 h-4" />
                                </a>
                                <button 
                                    type="button"
                                    onclick={() => triggerDelete(item.id, item.nama)}
                                    class="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded smooth-transition"
                                    title="Hapus"
                                >
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    {/each}

                    {#if divisiList.length === 0}
                    <tr>
                        <td colspan="5" class="px-6 py-10 text-center font-semibold opacity-60 text-primary-text bg-white/20">
                            <p>Belum ada data divisi.</p>
                            <a href="/admin/dashboard/devisi/tambah" class="text-primary hover:underline mt-2 inline-block">Mulai tambahkan sekarang.</a>
                        </td>
                    </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>