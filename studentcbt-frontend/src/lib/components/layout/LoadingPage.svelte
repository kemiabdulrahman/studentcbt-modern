<script>
	export let message = 'Loading...';
	export let showSpinner = true;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="text-center">
		{#if showSpinner}
			<div class="mx-auto mb-4">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
			</div>
		{/if}
		
		<h2 class="text-lg font-medium text-gray-900">
			{message}
		</h2>
		
		<slot />
	</div>
</div>