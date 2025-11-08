<script>
	export let padding = true;
	export let shadow = true;
	export let border = true;

	$: classes = [
		'bg-white rounded-lg',
		shadow ? 'shadow' : '',
		border ? 'border border-gray-200' : '',
		padding ? 'p-6' : '',
		$$props.class || ''
	].filter(Boolean).join(' ');
</script>

<div class={classes}>
	<slot />
</div>