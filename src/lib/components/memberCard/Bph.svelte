<script lang="ts">
    interface BphProps {
        name: string;
        position: string;
        imageUrl: string;
    }

    let { name, position, imageUrl }: BphProps = $props();

</script>

<div class="card w-full bg-primary/30 border border-slate-800/10 rounded-2xl p-3 gap-4 h-full group group-hover:shadow-lg  md:w-60 flex flex-col items-center justify-center">
    <img src={imageUrl} alt={name} class="rounded-md w-24 h-24 object-cover mb-2" />
    <div class="card-body flex flex-col items-center justify-center gap-1">
        <h2 class="card-title text-lg font-bold">{name}</h2>
        <p class="bg-secondary text-white py-1 px-2 rounded-full text-sm font-medium min-w-20 text-center">{position}</p>
    </div>
</div>