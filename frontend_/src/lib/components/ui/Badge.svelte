<script>
	let { color = 'gray', size = 'md', variant = 'default', ...rest } = $props();

	const sizeClasses = $derived({
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-2.5 py-0.5 text-xs',
		lg: 'px-3 py-1 text-sm'
	}[size]);

	const colorClasses = $derived({
		gray: 'bg-gray-100 text-gray-800',
		red: 'bg-red-100 text-red-800',
		yellow: 'bg-yellow-100 text-yellow-800',
		green: 'bg-green-100 text-green-800',
		blue: 'bg-blue-100 text-blue-800',
		indigo: 'bg-indigo-100 text-indigo-800',
		purple: 'bg-purple-100 text-purple-800',
		pink: 'bg-pink-100 text-pink-800'
	}[color]);

	const dotColorClasses = $derived({
		gray: 'text-gray-500',
		red: 'text-red-500',
		yellow: 'text-yellow-500',
		green: 'text-green-500',
		blue: 'text-blue-500',
		indigo: 'text-indigo-500',
		purple: 'text-purple-500',
		pink: 'text-pink-500'
	}[color]);

	const classes = $derived([
		'inline-flex items-center font-medium rounded-full',
		sizeClasses,
		colorClasses,
		rest.class || ''
	].filter(Boolean).join(' '));
</script>

<span class={classes}>
	{#if variant === 'dot'}
		<svg class="w-1.5 h-1.5 mr-1.5 {dotColorClasses}" fill="currentColor" viewBox="0 0 8 8">
			<circle cx="4" cy="4" r="3" />
		</svg>
	{/if}
	<slot />
</span>