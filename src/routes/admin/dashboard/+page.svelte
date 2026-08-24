<script lang="ts">
    import { Users, Building2, Newspaper, FileEdit, ArrowRight } from "@lucide/svelte";
    
    let { data } = $props();
    
    const { stats, recentProker } = $derived(data); //pastikan data dari props itu derived biar reactive terhadap perubahaan

    function formatDate(date: Date | string | null) {
        if (!date) return "-";
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }
</script>

<div class="flex flex-col stack-lg">
    <div class="flex items-center justify-between">
        <div class="stack-sm">
            <h1 class="text-3xl font-extrabold tracking-tight text-title-text">Dashboard Overview</h1>
            <p class="text-base opacity-80 text-primary-text">Ringkasan data profil HIMATIF</p>
        </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1 -->
        <div class="glass-card p-6 rounded flex flex-col gap-4 hover-lift" style="box-shadow: var(--shadow-card-md);">
            <div class="flex items-center gap-4">
                <div class="icon-container rounded">
                    <Building2 class="w-7 h-7 text-secondary" />
                </div>
                <div>
                    <p class="text-sm opacity-80 font-semibold text-primary-text">Total Divisi</p>
                    <h3 class="text-3xl font-extrabold text-title-text tracking-tight">{stats.devisiCount}</h3>
                </div>
            </div>
        </div>

        <!-- Card 2 -->
        <div class="glass-card p-6 rounded flex flex-col gap-4 hover-lift" style="box-shadow: var(--shadow-card-md);">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shadow-sm">
                    <Users class="w-6 h-6" />
                </div>
                <div>
                    <p class="text-sm opacity-80 font-semibold text-primary-text">Total Anggota</p>
                    <h3 class="text-3xl font-extrabold text-title-text tracking-tight">{stats.memberCount}</h3>
                </div>
            </div>
        </div>

        <!-- Card 3 -->
        <div class="glass-card p-6 rounded flex flex-col gap-4 hover-lift" style="box-shadow: var(--shadow-card-md);">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded bg-green-500/10 border border-green-500/20 text-green-600 flex items-center justify-center shadow-sm">
                    <Newspaper class="w-6 h-6" />
                </div>
                <div>
                    <p class="text-sm opacity-80 font-semibold text-primary-text">Proker Publish</p>
                    <h3 class="text-3xl font-extrabold text-title-text tracking-tight">{stats.prokerPublished}</h3>
                </div>
            </div>
        </div>

        <!-- Card 4 -->
        <div class="glass-card p-6 rounded flex flex-col gap-4 hover-lift" style="box-shadow: var(--shadow-card-md);">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shadow-sm">
                    <FileEdit class="w-6 h-6" />
                </div>
                <div>
                    <p class="text-sm opacity-80 font-semibold text-primary-text">Proker Draft</p>
                    <h3 class="text-3xl font-extrabold text-title-text tracking-tight">{stats.prokerDraft}</h3>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Proker Table -->
    <div class="glass-card rounded flex flex-col overflow-hidden" style="box-shadow: var(--shadow-card-md);">
        <div class="p-6 border-b border-primary/10 flex justify-between items-center bg-white/30">
            <h2 class="text-xl font-extrabold text-title-text">Program Kerja Terbaru</h2>
            <a href="/admin/dashboard/proker" class="text-sm font-bold text-secondary hover:text-primary smooth-transition inline-flex items-center gap-1 group">
                Lihat Semua <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 text-sm uppercase tracking-wider text-secondary font-bold">
                        <th class="px-6 py-4">Judul Proker</th>
                        <th class="px-6 py-4">Tanggal Kegiatan</th>
                        <th class="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary/10 bg-white/20">
                    {#each recentProker as proker (proker.title)} <!-- pastikan kalau pakai each ada keynya kamu bisa pakai variable apapun yang penting value nya berbeda setiap loop -->
                    <tr class="hover:bg-white/40 smooth-transition group">
                        <td class="px-6 py-4">
                            <span class="font-bold text-title-text block">{proker.title}</span>
                            <span class="text-xs opacity-60 text-primary-text block mt-1">/{proker.slug}</span>
                        </td>
                        <td class="px-6 py-4 text-sm font-semibold opacity-80 text-primary-text">
                            {formatDate(proker.date)}
                        </td>
                        <td class="px-6 py-4">
                            {#if proker.publishedAt}
                                <span class="px-3 py-1 text-xs font-bold bg-green-500/20 text-green-700 rounded border border-green-500/30">
                                    Published
                                </span>
                            {:else}
                                <span class="px-3 py-1 text-xs font-bold bg-amber-500/20 text-amber-700 rounded border border-amber-500/30">
                                    Draft
                                </span>
                            {/if}
                        </td>
                    </tr>
                    {/each}
                    
                    {#if recentProker.length === 0}
                    <tr>
                        <td colspan="3" class="px-6 py-8 text-center font-semibold opacity-60 text-primary-text bg-white/20">
                            Belum ada program kerja yang ditambahkan.
                        </td>
                    </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>