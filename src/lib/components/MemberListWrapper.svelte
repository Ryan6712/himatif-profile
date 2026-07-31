<script lang="ts">
    let { jabatan = "himatif" , children } = $props()


</script>


<div class="wrapper bg-amber-200">
    <div class="title-wrapper flex flex-row gap-4 items-center pb-2 border-b-4 border-b-tertiary">
        <img src="https://placehold.co/48x48/png?text=himatif" alt="">
        <h1 class="text-xl font-bold">{jabatan}</h1>
    </div>

    <div class="content">
        {@render children()}
    </div>
</div>