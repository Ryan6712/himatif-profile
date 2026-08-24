<script lang="ts">
    interface MemberProps {
        name: string;
        devisi: string;
        imageUrl: string;
    }

    let { name, devisi, imageUrl }: MemberProps = $props();

</script>

<div class="card w-full glass-card rounded-2xl p-3 gap-4 h-full group hover-lift max-w-45 flex flex-col items-center justify-center text-center">
    <!-- Image 96x96 -->
    <div class="w-24 h-24 rounded-xl overflow-hidden mb-2 ring-2 ring-primary/30 ring-offset-2 ring-offset-background shrink-0">
        <img src={imageUrl} alt={name} class="w-full h-full object-cover" />
    </div>
    <div class="card-body flex flex-col items-center justify-center gap-1 w-full">
        <h2 class="card-title font-bold text-center text-title-text">{name}</h2>
        <p class="text-secondary font-semibold text-sm">{devisi}</p>
    </div>
</div>