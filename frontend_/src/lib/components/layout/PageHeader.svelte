<script>
	export let title = '';
	export let subtitle = '';
	export let showBackButton = false;
	export let backHref = '';

	import { goto } from '$app/navigation';
	import { ArrowLeft } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';

	function handleBack() {
		if (backHref) {
			goto(backHref);
		} else {
			history.back();
		}
	}
</script>

<div class="mb-6">
	{#if showBackButton}
		<div class="mb-4">
			<Button 
				variant="ghost" 
				size="sm"
				on:click={handleBack}
			>
				<ArrowLeft class="h-4 w-4 mr-2" />
				Back
			</Button>
		</div>
	{/if}

	<div class="md:flex md:items-center md:justify-between">
		<div class="min-w-0 flex-1">
			<h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
				{title}
			</h1>
			{#if subtitle}
				<p class="mt-1 text-sm text-gray-500">
					{subtitle}
				</p>
			{/if}
		</div>
		
		{#if $$slots.actions}
			<div class="mt-4 flex md:mt-0 md:ml-4">
				<slot name="actions" />
			</div>
		{/if}
	</div>
</div>