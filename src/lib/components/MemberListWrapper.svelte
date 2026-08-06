<script lang="ts">
    let { jabatan = "himatif" , children } = $props()


</script>


<div class="wrapper">
    <div class="title-wrapper flex flex-row gap-4 items-center pb-3 mb-6 gradient-border-bottom relative">
        <div class="icon-container">
            <img src="https://placehold.co/48x48/png?text=himatif" alt="" class="w-10 h-10">
        </div>
        <h1 class="text-2xl font-bold tracking-wide text-title-text">{jabatan}</h1>
    </div>

    <div class="content container">
        {@render children()}
    </div>
</div>


<style>
  
</style>