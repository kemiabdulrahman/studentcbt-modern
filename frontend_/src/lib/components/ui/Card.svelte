<script>
	let { padding = true, shadow = true, border = true, ...rest } = $props();

	const classes = $derived([
		'bg-white rounded-lg',
		shadow ? 'shadow' : '',
		border ? 'border border-gray-200' : '',
		padding ? 'p-6' : '',
		rest.class || ''
	].filter(Boolean).join(' '));
</script>

<div class={classes}>
	<slot />
</div>