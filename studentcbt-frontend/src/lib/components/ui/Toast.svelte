<script>
	import { fly } from 'svelte/transition';
	import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-svelte';

	/**
	 * @type {import('$stores/ui').ToastMessage}
	 */
	export let toast;
	export let onDismiss;

	$: icon = {
		success: CheckCircle,
		error: AlertCircle,
		warning: AlertTriangle,
		info: Info
	}[toast.type];

	$: colorClasses = {
		success: 'bg-success-50 border-success-200 text-success-800',
		error: 'bg-error-50 border-error-200 text-error-800',
		warning: 'bg-warning-50 border-warning-200 text-warning-800',
		info: 'bg-primary-50 border-primary-200 text-primary-800'
	}[toast.type];

	$: iconColorClasses = {
		success: 'text-success-500',
		error: 'text-error-500',
		warning: 'text-warning-500',
		info: 'text-primary-500'
	}[toast.type];
</script>

<div
	class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border {colorClasses}"
	transition:fly={{ x: 300, duration: 300 }}
>
	<div class="p-4">
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<svelte:component this={icon} class="h-5 w-5 {iconColorClasses}" />
			</div>
			<div class="ml-3 w-0 flex-1">
				<p class="text-sm font-medium">
					{toast.message}
				</p>
			</div>
			{#if toast.dismissible}
				<div class="ml-4 flex-shrink-0 flex">
					<button
						class="rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
						on:click={() => onDismiss(toast.id)}
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>