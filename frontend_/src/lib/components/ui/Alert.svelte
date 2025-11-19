<script>
	import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	let { type = 'info', dismissible = false, title = '' } = $props();

	const dispatch = createEventDispatcher();

	const icon = $derived({
		success: CheckCircle,
		error: AlertCircle,
		warning: AlertTriangle,
		info: Info
	}[type]);

	const colorClasses = $derived({
		success: 'bg-success-50 border-success-200 text-success-800',
		error: 'bg-error-50 border-error-200 text-error-800',
		warning: 'bg-warning-50 border-warning-200 text-warning-800',
		\t\tinfo: 'bg-primary-50 border-primary-200 text-primary-800'\n\t}[type]);\n\n\tconst iconColorClasses = $derived({\n\t\tsuccess: 'text-success-500',\n\t\terror: 'text-error-500',\n\t\twarning: 'text-warning-500',\n\t\tinfo: 'text-primary-500'\n\t}[type]);\n\n\tfunction dismiss() {\n\t\tdispatch('dismiss');\n\t}
</script>

<div class="rounded-md p-4 border {colorClasses}">
	<div class="flex">
		<div class="flex-shrink-0">
			<svelte:component this={icon} class="h-5 w-5 {iconColorClasses}" />
		</div>
		<div class="ml-3 flex-1">
			{#if title}
				<h3 class="text-sm font-medium">
					{title}
				</h3>
				<div class="mt-2 text-sm">
					<slot />
				</div>
			{:else}
				<div class="text-sm">
					<slot />
				</div>
			{/if}
		</div>
		{#if dismissible}
			<div class="ml-auto pl-3">
				<div class="-mx-1.5 -my-1.5">
					<button
						type="button"
						class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
						on:click={dismiss}
					>
						<X class="h-5 w-5" />
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>