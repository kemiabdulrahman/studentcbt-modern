<script>
	export let size = 'md'; // 'sm' | 'md' | 'lg'
	export let color = 'primary'; // 'primary' | 'white' | 'gray'

	$: sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8'
	}[size];

	$: colorClasses = {
		primary: 'text-primary-600',
		white: 'text-white',
		gray: 'text-gray-600'
	}[color];
</script>

<div class="animate-spin rounded-full border-2 border-current border-t-transparent {sizeClasses} {colorClasses}" role="status" aria-label="loading">
	<span class="sr-only">Loading...</span>
</div>