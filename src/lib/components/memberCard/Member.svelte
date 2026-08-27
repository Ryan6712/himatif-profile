<script lang="ts">
	interface MemberProps {
		name: string;
		devisi: string;
		imageUrl: string;
	}

	let { name, devisi, imageUrl }: MemberProps = $props();
</script>

<div
	class="card glass-card group hover-lift flex h-full w-full max-w-45 flex-col items-center justify-center gap-4 rounded-2xl p-3 text-center"
>
	<!-- Image 96x96 -->
	<div
		class="mb-2 h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
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
	<div class="card-body flex w-full flex-col items-center justify-center gap-1">
		<h2 class="card-title text-center font-bold text-title-text">{name}</h2>
		<p class="text-sm font-semibold text-secondary">{devisi}</p>
	</div>
</div>
