<script lang="ts">
    import type { Snippet } from "svelte";


    let { jabatan = "himatif", icon, children }: { jabatan?: string; icon: Snippet; children: Snippet } = $props()


</script>


<div class="wrapper">
    <div class="title-wrapper flex flex-row gap-4 items-center pb-3 mb-6 gradient-border-bottom relative">
        <div class="icon-container  flex justify-center items-center">
            {@render icon()}
        </div>
        <h1 class="text-2xl font-bold tracking-wide text-title-text">{jabatan}</h1>
    </div>

    <div class="content container">
        {@render children()}
    </div>
</div>
