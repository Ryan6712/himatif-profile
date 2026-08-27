<script lang="ts">
	interface KadivProps {
		name: string;
		position: string;
		imageUrl: string;
		devisi: string;
	}

	let { name, position, imageUrl, devisi }: KadivProps = $props();
</script>

<div
	class="card glass-card group hover-lift flex h-full w-full max-w-100 min-w-75 flex-row items-center justify-start gap-4 rounded-2xl p-4"
>
	<!-- Image 96x96 -->
	<div
		class="h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
	>
		<img
			src={imageUrl}
			alt={name}
			width="96"
			height="96"
			loading="lazy"
			decoding="async"
			class="h-full w-full object-cover"
		/>
	</div>
	<div class="card-body flex w-full flex-col gap-0.5">
		<h2 class="card-title text-lg font-bold text-title-text">{name}</h2>
		<p class="font-semibold text-secondary">{position}</p>
		<p class="font-light opacity-70">{devisi}</p>
	</div>
</div>
