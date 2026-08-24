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
        value = "", 
        placeholder = "", 
        required = false,
        rows = 4, 
        error = "", 
        disabled = false,
        hint = ""
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
        class="px-4 py-3 rounded border bg-background/80 text-title-text focus:outline-none focus:ring-2 smooth-transition w-full disabled:opacity-50 disabled:cursor-not-allowed resize-y
               {error ? 'border-red-500 focus:ring-red-500/50' : 'border-primary/20 focus:ring-primary/50 focus:border-primary'}"
    >{value}</textarea>

    {#if hint && !error}
        <span class="text-xs text-primary-text opacity-60 mt-1">{hint}</span>
    {/if}
    
    {#if error}
        <span class="text-xs font-semibold text-red-500 mt-1">{error}</span>
    {/if}
</div>