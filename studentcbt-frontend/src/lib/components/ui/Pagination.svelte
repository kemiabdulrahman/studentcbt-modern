<script>
	import { createEventDispatcher } from 'svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import Button from './Button.svelte';

	export let currentPage = 1;
	export let totalPages = 1;
	export let totalItems = 0;
	export let itemsPerPage = 10;
	export let showInfo = true;
	export let showPageNumbers = true;
	export let maxPageNumbers = 5;

	const dispatch = createEventDispatcher();

	$: startItem = (currentPage - 1) * itemsPerPage + 1;
	$: endItem = Math.min(currentPage * itemsPerPage, totalItems);
	$: hasNext = currentPage < totalPages;
	$: hasPrev = currentPage > 1;

	$: visiblePages = (() => {
		const pages = [];
		const start = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
		const end = Math.min(totalPages, start + maxPageNumbers - 1);
		
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		
		return pages;
	})();

	function goToPage(page) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			dispatch('page-change', page);
		}
	}

	function nextPage() {
		if (hasNext) {
			goToPage(currentPage + 1);
		}
	}

	function prevPage() {
		if (hasPrev) {
			goToPage(currentPage - 1);
		}
	}
</script>

<div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
	{#if showInfo}
		<div class="flex flex-1 justify-between sm:hidden">
			<Button
				variant="outline"
				size="sm"
				disabled={!hasPrev}
				on:click={prevPage}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={!hasNext}
				on:click={nextPage}
			>
				Next
			</Button>
		</div>
	{/if}

	<div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
		{#if showInfo}
			<div>
				<p class="text-sm text-gray-700">
					Showing
					<span class="font-medium">{startItem}</span>
					to
					<span class="font-medium">{endItem}</span>
					of
					<span class="font-medium">{totalItems}</span>
					results
				</p>
			</div>
		{/if}

		<div>
			<nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
				<!-- Previous Button -->
				<button
					class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={!hasPrev}
					on:click={prevPage}
				>
					<ChevronLeft class="h-5 w-5" />
				</button>

				{#if showPageNumbers}
					<!-- Page Numbers -->
					{#if visiblePages[0] > 1}
						<button
							class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
							on:click={() => goToPage(1)}
						>
							1
						</button>
						{#if visiblePages[0] > 2}
							<span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
								...
							</span>
						{/if}
					{/if}

					{#each visiblePages as page}
						<button
							class="relative inline-flex items-center px-4 py-2 text-sm font-semibold {page === currentPage 
								? 'bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600' 
								: 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}"
							on:click={() => goToPage(page)}
						>
							{page}
						</button>
					{/each}

					{#if visiblePages[visiblePages.length - 1] < totalPages}
						{#if visiblePages[visiblePages.length - 1] < totalPages - 1}
							<span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
								...
							</span>
						{/if}
						<button
							class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
							on:click={() => goToPage(totalPages)}
						>
							{totalPages}
						</button>
					{/if}
				{/if}

				<!-- Next Button -->
				<button
					class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={!hasNext}
					on:click={nextPage}
				>
					<ChevronRight class="h-5 w-5" />
				</button>
			</nav>
		</div>
	</div>
</div>