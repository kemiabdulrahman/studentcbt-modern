<script>
	/**
	 * @typedef {Object} Column
	 * @property {string} key
	 * @property {string} label
	 * @property {boolean} [sortable]
	 * @property {string} [align] - 'left' | 'center' | 'right'
	 * @property {Function} [render]
	 */

	/**
	 * @type {Column[]}
	 */
	export let columns = [];
	
	/**
	 * @type {any[]}
	 */
	export let data = [];
	
	export let loading = false;
	export let emptyMessage = 'No data available';
	export let sortKey = '';
	export let sortDirection = 'asc';

	import { createEventDispatcher } from 'svelte';
	import { ChevronUp, ChevronDown, Loader2 } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	function handleSort(column) {
		if (!column.sortable) return;
		
		if (sortKey === column.key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = column.key;
			sortDirection = 'asc';
		}
		
		dispatch('sort', { key: sortKey, direction: sortDirection });
	}

	function getCellValue(item, column) {
		if (column.render) {
			return column.render(item);
		}
		return column.key.split('.').reduce((obj, key) => obj?.[key], item) || '';
	}

	function getAlignment(align) {
		return {
			left: 'text-left',
			center: 'text-center',
			right: 'text-right'
		}[align] || 'text-left';
	}
</script>

<div class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
	<table class="min-w-full divide-y divide-gray-300">
		<thead class="bg-gray-50">
			<tr>
				{#each columns as column}
					<th 
						class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider {getAlignment(column.align)} {column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}"
						on:click={() => handleSort(column)}
						role={column.sortable ? 'button' : undefined}
						tabindex={column.sortable ? 0 : undefined}
					>
						<div class="flex items-center {column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'}">
							{column.label}
							{#if column.sortable && sortKey === column.key}
								{#if sortDirection === 'asc'}
									<ChevronUp class="ml-1 h-4 w-4" />
								{:else}
									<ChevronDown class="ml-1 h-4 w-4" />
								{/if}
							{/if}
						</div>
					</th>
				{/each}
				<slot name="header" />
			</tr>
		</thead>
		<tbody class="bg-white divide-y divide-gray-200">
			{#if loading}
				<tr>
					<td colspan={columns.length} class="px-6 py-12 text-center">
						<div class="flex items-center justify-center">
							<Loader2 class="h-6 w-6 animate-spin mr-2" />
							Loading...
						</div>
					</td>
				</tr>
			{:else if data.length === 0}
				<tr>
					<td colspan={columns.length} class="px-6 py-12 text-center text-gray-500">
						{emptyMessage}
					</td>
				</tr>
			{:else}
				{#each data as item, index}
					<tr class="hover:bg-gray-50">
						{#each columns as column}
							<td class="px-6 py-4 whitespace-nowrap text-sm {getAlignment(column.align)}">
								{@html getCellValue(item, column)}
							</td>
						{/each}
						<slot name="row" {item} {index} />
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>