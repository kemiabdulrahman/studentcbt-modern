<script>
	import { createEventDispatcher } from 'svelte';

	/**
	 * @type {Array<{value: string, label: string}>}
	 */
	export let options = [];
	export let value = '';
	export let placeholder = 'Select an option';
	export let disabled = false;
	export let required = false;
	export let error = '';
	export let label = '';
	export let hint = '';
	export let id = '';

	const dispatch = createEventDispatcher();

	$: hasError = !!error;
	$: selectClasses = [
		'block w-full rounded-md shadow-sm sm:text-sm transition-colors',
		hasError 
			? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
			: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
		disabled ? 'bg-gray-100 cursor-not-allowed' : '',
		$$props.class || ''
	].filter(Boolean).join(' ');

	function handleChange(event) {
		value = event.target.value;
		dispatch('change', event);
	}
</script>

<div class="space-y-1">
	{#if label}
		<label for={id} class="block text-sm font-medium text-gray-700">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}
	
	<select
		{id}
		{disabled}
		{required}
		{value}
		class={selectClasses}
		on:change={handleChange}
		{...$$restProps}
	>
		{#if placeholder}
			<option value="">{placeholder}</option>
		{/if}
		
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	
	{#if hint && !hasError}
		<p class="text-xs text-gray-500">{hint}</p>
	{/if}
	
	{#if hasError}
		<p class="text-xs text-red-600">{error}</p>
	{/if}
</div>