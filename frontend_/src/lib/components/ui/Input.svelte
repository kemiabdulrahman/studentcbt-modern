<script>
import { createEventDispatcher } from 'svelte';

let { value = '', type = 'text', placeholder = '', disabled = false, readonly = false, required = false, error = '', label = '', hint = '', id = '', ...rest } = $props();

const dispatch = createEventDispatcher();

const hasError = $derived(!!error);
const inputClasses = $derived([
'block w-full rounded-md shadow-sm sm:text-sm transition-colors',
hasError 
? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
disabled ? 'bg-gray-100 cursor-not-allowed' : '',
rest.class || ''
].filter(Boolean).join(' '));

function handleInput(event) {
value = event.target.value;
dispatch('input', event);
}

function handleChange(event) {
dispatch('change', event);
}

function handleFocus(event) {
dispatch('focus', event);
}

function handleBlur(event) {
dispatch('blur', event);
}
</script>

<div class="space-y-2">
{#if label}
<label for={id} class="block text-sm font-medium text-gray-700">
{label}
{#if required}
<span class="text-red-500">*</span>
{/if}
</label>
{/if}

<input
{id}
{type}
{placeholder}
{disabled}
{readonly}
{required}
bind:value
class={inputClasses}
on:input={handleInput}
on:change={handleChange}
on:focus={handleFocus}
on:blur={handleBlur}
/>

{#if hint && !hasError}
<p class="text-xs text-gray-500">{hint}</p>
{/if}

{#if hasError}
<p class="text-xs text-red-600">{error}</p>
{/if}
</div>
