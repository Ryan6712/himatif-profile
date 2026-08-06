<script lang="ts">
    interface KadivProps {
        name: string;
        position: string;
        imageUrl: string;
        devisi: string;
    }

    let { name, position, imageUrl, devisi }: KadivProps = $props();

</script>

<div class="card bg-primary/30 border border-slate-800/10 rounded-2xl p-3 gap-4 h-full group group-hover:shadow-lg max-w-100 flex flex-row items-center justify-start w-full">
    <img src={imageUrl} alt={name} class="rounded-md w-24 h-24 object-cover mb-2" />
    <div class="card-body">
        <h2 class="card-title text-lg font-bold">{name}</h2>
        <p class="text-secondary font-semibold">{position}</p>
        <p class="font-light">{devisi}</p>
    </div>
</div>