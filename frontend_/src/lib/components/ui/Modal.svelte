<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { X } from 'lucide-svelte';
	import Button from './Button.svelte';

	export let open = false;
	export let closeable = true;
	export let title = '';
	export let size = 'md'; // sm, md, lg, xl, full
	export let showHeader = true;
	export let showFooter = false;

	const dispatch = createEventDispatcher();

	let dialogElement;

	$: sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
		full: 'max-w-full mx-4'
	}[size];

	onMount(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape' && open && closeable) {
				close();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	});

	$: if (open) {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = '';
	}

	function close() {
		if (closeable) {
			open = false;
			dispatch('close');
		}
	}

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget && closeable) {
			close();
		}
	}
</script>

{#if open}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
		on:click={handleBackdropClick}
		role="presentation"
	></div>

	<!-- Modal -->
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
			<div 
				bind:this={dialogElement}
				class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full {sizeClasses}"
				role="dialog"
				aria-modal="true"
			>
				{#if showHeader}
					<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-medium leading-6 text-gray-900">
								{title}
							</h3>
							{#if closeable}
								<button
									type="button"
									class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
									on:click={close}
								>
									<X class="h-6 w-6" />
								</button>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Content -->
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6">
					<slot />
				</div>

				{#if showFooter}
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
						<slot name="footer">
							<Button on:click={close}>Close</Button>
						</slot>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}