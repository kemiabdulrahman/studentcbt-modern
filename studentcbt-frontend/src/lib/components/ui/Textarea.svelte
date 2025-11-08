<script>
	import { createEventDispatcher } from 'svelte';

	export let value = '';
	export let placeholder = '';
	export let disabled = false;
	export let readonly = false;
	export let required = false;
	export let rows = 4;
	export let error = '';
	export let label = '';
	export let hint = '';
	export let id = '';
	export let maxlength = null;

	const dispatch = createEventDispatcher();

	$: hasError = !!error;
	$: textareaClasses = [
		'block w-full rounded-md shadow-sm sm:text-sm transition-colors resize-vertical',
		hasError 
			? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
			: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
		disabled ? 'bg-gray-100 cursor-not-allowed' : '',
		$$props.class || ''
	].filter(Boolean).join(' ');

	$: characterCount = value.length;

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

<div class="space-y-1">
	{#if label}
		<div class="flex justify-between">
			<label for={id} class="block text-sm font-medium text-gray-700">
				{label}
				{#if required}
					<span class="text-red-500">*</span>
				{/if}
			</label>
			{#if maxlength}
				<span class="text-xs text-gray-500">
					{characterCount}/{maxlength}
				</span>
			{/if}
		</div>
	{/if}
	
	<textarea
		{id}
		{placeholder}
		{disabled}
		{readonly}
		{required}
		{rows}
		{maxlength}
		{value}
		class={textareaClasses}
		on:input={handleInput}
		on:change={handleChange}
		on:focus={handleFocus}
		on:blur={handleBlur}
		{...$$restProps}
	></textarea>
	
	{#if hint && !hasError}
		<p class="text-xs text-gray-500">{hint}</p>
	{/if}
	
	{#if hasError}
		<p class="text-xs text-red-600">{error}</p>
	{/if}
</div>