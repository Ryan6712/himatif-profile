<script lang="ts">
    interface MemberProps {
        name: string;
        devisi: string;
        imageUrl: string;
    }

    let { name, devisi, imageUrl }: MemberProps = $props();

</script>

<div class="card w-full bg-primary/30 border border-slate-800/10 rounded-2xl p-3 gap-4 h-full group group-hover:shadow-lg max-w-45 flex flex-col items-center justify-center">
    <img src={imageUrl} alt={name} class="rounded-md w-24 h-24 object-cover mb-2" />
    <div class="card-body flex flex-col items-center justify-center gap-1">
        <h2 class="card-title font-bold text-center">{name}</h2>
        <p class="text-secondary font-semibold">{devisi}</p>
    </div>
</div>