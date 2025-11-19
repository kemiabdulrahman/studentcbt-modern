<script>
	export let title = 'No data found';
	export let description = '';
	export let icon = null;
	export let showAction = false;
	export let actionText = 'Create New';
	export let actionHref = null;

	import { createEventDispatcher } from 'svelte';
	import Button from '$components/ui/Button.svelte';
	import { FolderOpen } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	$: displayIcon = icon || FolderOpen;

	function handleAction() {
		if (actionHref) {
			window.location.href = actionHref;
		} else {
			dispatch('action');
		}
	}
</script>

<div class="text-center py-12">
	<div class="mx-auto h-12 w-12 text-gray-400">
		<svelte:component this={displayIcon} class="h-12 w-12" />
	</div>
	
	<h3 class="mt-4 text-sm font-medium text-gray-900">
		{title}
	</h3>
	
	{#if description}
		<p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">
			{description}
		</p>
	{/if}
	
	{#if showAction}
		<div class="mt-6">
			{#if actionHref}
				<Button href={actionHref} variant="primary">
					{actionText}
				</Button>
			{:else}
				<Button variant="primary" on:click={handleAction}>
					{actionText}
				</Button>
			{/if}
		</div>
	{/if}

	<slot />
</div>