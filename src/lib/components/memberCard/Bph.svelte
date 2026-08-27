<script lang="ts">
	interface BphProps {
		name: string;
		position: string;
		imageUrl: string;
	}

	let { name, position, imageUrl }: BphProps = $props();
</script>

<div
	class="card glass-card group hover-lift flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl p-4 md:w-60"
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
	<div class="card-body flex w-full flex-col items-center justify-center gap-1.5 text-center">
		<h2 class="card-title text-lg font-bold text-title-text">{name}</h2>
		<p
			class="min-w-20 rounded-full px-3 py-1 text-center text-sm font-semibold text-white"
			style="background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-hover) 100%); box-shadow: var(--shadow-card);"
		>
			{position}
		</p>
	</div>
</div>
