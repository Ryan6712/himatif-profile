<script lang="ts">
    interface BphProps {
        name: string;
        position: string;
        imageUrl: string;
    }

    let { name, position, imageUrl }: BphProps = $props();

</script>

<div class="card w-full glass-card rounded-2xl p-4 gap-4 h-full group hover-lift md:w-60 flex flex-col items-center justify-center">
    <img src={imageUrl} alt={name} class="rounded-xl w-24 h-24 object-cover mb-2 ring-2 ring-primary/30 ring-offset-2 ring-offset-background" />
    <div class="card-body flex flex-col items-center justify-center gap-1.5">
        <h2 class="card-title text-lg font-bold text-title-text">{name}</h2>
        <p class="text-white py-1 px-3 rounded-full text-sm font-semibold min-w-20 text-center" style="background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-hover) 100%); box-shadow: var(--shadow-card);">{position}</p>
    </div>
</div>