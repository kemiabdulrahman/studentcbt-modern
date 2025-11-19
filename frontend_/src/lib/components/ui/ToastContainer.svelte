<script>
	import { toastStore } from '$stores/ui';
	import Toast from './Toast.svelte';

	$: toasts = $toastStore;

	function handleDismiss(id) {
		toastStore.dismiss(id);
	}
</script>

{#if toasts.length > 0}
	<div class="fixed top-4 right-4 z-50 space-y-4">
		{#each toasts as toast (toast.id)}
			<Toast {toast} onDismiss={handleDismiss} />
		{/each}
	</div>
{/if}