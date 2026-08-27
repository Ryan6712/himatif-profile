<script lang="ts">
	interface Props {
		label: string;
		name: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		rows?: number;
		error?: string;
		disabled?: boolean;
		hint?: string;
	}

	let {
		label,
		name,
		value = '',
		placeholder = '',
		required = false,
		rows = 4,
		error = '',
		disabled = false,
		hint = ''
	}: Props = $props();
</script>

<div class="form-control flex flex-col gap-2">
	<label for={name} class="text-sm font-bold text-primary-text opacity-90">
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</label>

	<textarea
		{name}
		id={name}
		{rows}
		{placeholder}
		{required}
		{disabled}
		class="smooth-transition w-full resize-y rounded border bg-background/80 px-4 py-3 text-title-text focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50
               {error
			? 'border-red-500 focus:ring-red-500/50'
			: 'border-primary/20 focus:border-primary focus:ring-primary/50'}">{value}</textarea
	>

	{#if hint && !error}
		<span class="mt-1 text-xs text-primary-text opacity-60">{hint}</span>
	{/if}

	{#if error}
		<span class="mt-1 text-xs font-semibold text-red-500">{error}</span>
	{/if}
</div>
