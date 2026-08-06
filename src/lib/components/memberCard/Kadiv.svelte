<script lang="ts">
    interface KadivProps {
        name: string;
        position: string;
        imageUrl: string;
        devisi: string;
    }

    let { name, position, imageUrl, devisi }: KadivProps = $props();

</script>

<div class="card glass-card rounded-2xl p-4 gap-4 h-full group hover-lift max-w-100 min-w-75 flex flex-row items-center justify-start w-full">
    <img src={imageUrl} alt={name} class="rounded-xl w-24 h-24 object-cover ring-2 ring-primary/30 ring-offset-2 ring-offset-background" />
    <div class="card-body flex flex-col gap-0.5">
        <h2 class="card-title text-lg font-bold text-title-text">{name}</h2>
        <p class="text-secondary font-semibold">{position}</p>
        <p class="font-light opacity-70">{devisi}</p>
    </div>
</div>