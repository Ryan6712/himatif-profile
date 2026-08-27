<script lang="ts">
	interface Props {
		label: string;
		name: string;
		type?: 'text' | 'email' | 'password' | 'url' | 'number' | 'date';
		value?: string | number | null;
		placeholder?: string;
		required?: boolean;
		error?: string;
		disabled?: boolean;
	}

	let {
		label,
		name,
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		required = false,
		error = '',
		disabled = false
	}: Props = $props();
</script>

<div class="form-control flex flex-col gap-2">
	<label for={name} class="text-sm font-bold text-primary-text opacity-90">
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</label>

	<input
		{type}
		{name}
		id={name}
		{value}
		{placeholder}
		{required}
		{disabled}
		class="smooth-transition w-full rounded border bg-background/80 px-4 py-3 text-title-text focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50
               {error
			? 'border-red-500 focus:ring-red-500/50'
			: 'border-primary/20 focus:border-primary focus:ring-primary/50'}"
	/>

	{#if error}
		<span class="mt-1 text-xs font-semibold text-red-500">{error}</span>
	{/if}
</div>
