<script lang="ts">
    interface Props {
      label: string;
      name: string;
      type?: "text" | "email" | "password" | "url" | "number" | "date";
      value?: string | number | null;
      placeholder?: string;
      required?: boolean;
      error?: string;
      disabled?: boolean;
    }
  
    let { 
        label, 
        name, 
        type = "text", 
        value = "", 
        placeholder = "",
        required = false, 
        error = "", 
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
        class="px-4 py-3 rounded border bg-background/80 text-title-text focus:outline-none focus:ring-2 smooth-transition w-full disabled:opacity-50 disabled:cursor-not-allowed
               {error ? 'border-red-500 focus:ring-red-500/50' : 'border-primary/20 focus:ring-primary/50 focus:border-primary'}"
    />
    
    {#if error}
        <span class="text-xs font-semibold text-red-500 mt-1">{error}</span>
    {/if}
</div>