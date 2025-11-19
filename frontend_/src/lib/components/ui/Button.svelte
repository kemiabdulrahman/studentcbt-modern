<script>
	import { createEventDispatcher } from 'svelte';
	import { Loader2 } from 'lucide-svelte';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		fullWidth = false,
		type = 'button',
		href = null,
		...rest
	} = $props();

	const dispatch = createEventDispatcher();

	const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
	
	const sizeClasses = $derived({
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	}[size]);
	
	const variantClasses = $derived({
		primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
		secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
		success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
		warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
		error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
		outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
		ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500'
	}[variant]);
	
	const classes = $derived([
		baseClasses,
		sizeClasses,
		variantClasses,
		fullWidth ? 'w-full' : '',
		rest.class || ''
	].filter(Boolean).join(' '));

	function handleClick(event) {
		if (!disabled && !loading) {
			dispatch('click', event);
		}
	}
</script>

{#if href}
	<a 
		{href}
		class={classes}
		on:click={handleClick}
		{...$$restProps}
	>
		{#if loading}
			<Loader2 class="w-4 h-4 mr-2 animate-spin" />
		{/if}
		<slot />
	</a>
{:else}
	<button
		{type}
		{disabled}
		class={classes}
		on:click={handleClick}
		{...$$restProps}
	>
		{#if loading}
			<Loader2 class="w-4 h-4 mr-2 animate-spin" />
		{/if}
		<slot />
	</button>
{/if}