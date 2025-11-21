<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';
	import { toastStore } from '$lib/stores/ui';

	let results = [];
	let pagination = {};
	let pageNum = 1;
	let limit = 10;
	let error = '';
	let loading = false;

	async function loadResults() {
		loading = true;
		error = '';
		try {
			const resp = await api.student.getResults({ page: pageNum, limit });
			
			if (!resp) {
				throw new Error('No response from server');
			}
			
			results = Array.isArray(resp.results) ? resp.results : [];
			pagination = resp.pagination || {};
			
			if (results.length === 0) {
				console.log('No results loaded');
			}
		} catch (err) {
			console.error('Load results failed', err);
			error = err.message || 'Failed to load results';
			results = [];
			pagination = {};
			toastStore.error(error);
		} finally {
			loading = false;
		}
	}

	function getGradeColor(percentage, passMarks) {
		if (percentage >= passMarks) return 'bg-green-100 text-green-800 border-green-300';
		return 'bg-red-100 text-red-800 border-red-300';
	}

	onMount(loadResults);
</script>

<div class="p-6 md:p-8">
	<h1 class="text-3xl font-bold mb-6">My Results</h1>

	{#if error}
		<div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<p class="mt-4">Loading results...</p>
		</div>
	{:else if results.length === 0}
		<div class="bg-white rounded-lg shadow p-8 text-center">
			<p class="text-gray-600">No results available yet. Complete some assessments to see your results here.</p>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="w-full">
				<thead class="bg-gray-100 border-b">
					<tr>
						<th class="px-6 py-3 text-left font-semibold">Assessment</th>
						<th class="px-6 py-3 text-left font-semibold">Subject</th>
						<th class="px-6 py-3 text-center font-semibold">Score</th>
						<th class="px-6 py-3 text-center font-semibold">Percentage</th>
						<th class="px-6 py-3 text-center font-semibold">Status</th>
						<th class="px-6 py-3 text-center font-semibold">Action</th>
					</tr>
				</thead>
				<tbody>
					{#each results.filter(r => r.percentage >= r.assessment.passMarks) as result}
						<tr class="border-b hover:bg-gray-50 transition">
							<td class="px-6 py-4 font-medium">{result.assessment.title}</td>
							<td class="px-6 py-4">{result.assessment.subject.name}</td>
							<td class="px-6 py-4 text-center">
								<div class="font-bold">{result.totalScore}</div>
								<div class="text-sm text-gray-600">/ {result.assessment.totalMarks}</div>
							</td>
							<td class="px-6 py-4 text-center">
								<span class="px-3 py-1 rounded font-semibold {getGradeColor(result.percentage, result.assessment.passMarks)} border">
									{result.percentage?.toFixed(1)}%
								</span>
							</td>
							<td class="px-6 py-4 text-center">
								{#if result.percentage >= result.assessment.passMarks}
									<span class="px-3 py-1 rounded bg-green-100 text-green-800 text-sm font-medium">Pass</span>
								{:else}
									<span class="px-3 py-1 rounded bg-red-100 text-red-800 text-sm font-medium">Fail</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-center">
								<a href={`/student/results/${result.assessment.id}`} class="text-blue-600 hover:text-blue-800 font-medium">
									View Details
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if pagination.pages > 1}
			<div class="flex justify-center gap-2 mt-6">
				<button 
					disabled={pageNum === 1}
					on:click={() => { pageNum--; loadResults(); }}
					class="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Previous
				</button>
				<div class="flex items-center gap-2">
					{#each Array(pagination.pages) as _, idx}
						<button 
							on:click={() => { pageNum = idx + 1; loadResults(); }}
							class="px-3 py-2 rounded border {pageNum === idx + 1 ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}"
						>
							{idx + 1}
						</button>
					{/each}
				</div>
				<button 
					disabled={pageNum === pagination.pages}
					on:click={() => { pageNum++; loadResults(); }}
					class="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Next
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Tailwind handles styling */
</style>
