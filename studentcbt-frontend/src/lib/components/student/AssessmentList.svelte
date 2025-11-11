<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';
	import { toastStore } from '$lib/stores/ui';

	export let assessments = [];
	export let loading = false;
	export let error = '';

	onMount(async () => {
		loading = true;
		try {
			const resp = await api.student.getAvailableAssessments();
			assessments = resp.assessments || [];
		} catch (err) {
			console.error('Load assessments failed', err);
			error = err.message || 'Failed to load assessments';
			toastStore.error(error);
		} finally {
			loading = false;
		}
	});

	function getStatusBadge(attemptStatus) {
		if (attemptStatus.hasAttempted) {
			if (attemptStatus.status === 'SUBMITTED') {
				return { label: 'Completed', color: 'bg-green-100 text-green-800' };
			} else if (attemptStatus.status === 'IN_PROGRESS') {
				return { label: 'In Progress', color: 'bg-blue-100 text-blue-800' };
			}
			return { label: attemptStatus.status, color: 'bg-gray-100 text-gray-800' };
		}
		return { label: 'Not Attempted', color: 'bg-gray-100 text-gray-800' };
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-0">
	{#if loading}
		<div class="col-span-full text-center py-12">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<p class="mt-4 text-sm sm:text-base">Loading assessments...</p>
		</div>
	{:else if error}
		<div class="col-span-full p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
			{error}
		</div>
	{:else if assessments.length === 0}
		<div class="col-span-full bg-white rounded-lg shadow p-6 sm:p-8 text-center">
			<p class="text-gray-600 text-sm sm:text-base">No assessments available at this time.</p>
		</div>
	{:else}
		{#each assessments as assessment}
			{@const status = getStatusBadge(assessment.attemptStatus)}
			<div class="bg-white rounded-lg shadow hover:shadow-lg transition p-4 sm:p-6 flex flex-col">
				<div class="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-3">
					<div class="flex-1 min-w-0">
						<h3 class="text-lg sm:text-xl font-semibold text-gray-800 truncate">{assessment.title}</h3>
						<p class="text-xs sm:text-sm text-gray-600 truncate">{assessment.subject.name}</p>
					</div>
					<span class="px-2 sm:px-3 py-1 rounded-full text-xs font-medium {status.color} whitespace-nowrap">
						{status.label}
					</span>
				</div>

				<p class="text-gray-700 mb-4 text-sm sm:text-base line-clamp-2">{assessment.description}</p>

				<div class="grid grid-cols-3 gap-2 mb-4 text-xs sm:text-sm">
					<div class="bg-gray-50 p-2 sm:p-3 rounded">
						<div class="text-gray-600 text-xs">Questions</div>
						<div class="font-bold text-sm sm:text-base">{assessment._count.questions}</div>
					</div>
					<div class="bg-gray-50 p-2 sm:p-3 rounded">
						<div class="text-gray-600 text-xs">Duration</div>
						<div class="font-bold text-sm sm:text-base">{assessment.duration}m</div>
					</div>
					<div class="bg-gray-50 p-2 sm:p-3 rounded">
						<div class="text-gray-600 text-xs">Marks</div>
						<div class="font-bold text-sm sm:text-base">{assessment.totalMarks}</div>
					</div>
				</div>

				{#if assessment.attemptStatus.hasAttempted}
					<div class="bg-blue-50 p-2 sm:p-3 rounded mb-4 text-xs sm:text-sm">
						<p class="font-semibold text-gray-900">Score: {assessment.attemptStatus.score} / {assessment.totalMarks}</p>
						<p class="text-gray-600">{assessment.attemptStatus.percentage?.toFixed(1) || 0}%</p>
					</div>
				{/if}

				<div class="mt-auto">
					{#if !assessment.attemptStatus.hasAttempted}
						<a href={`/student/assessments/${assessment.id}/take`} class="block w-full px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded font-medium hover:bg-blue-700 transition text-center">
							Start
						</a>
					{:else if assessment.attemptStatus.status === 'IN_PROGRESS'}
						<a href={`/student/assessments/${assessment.id}/take`} class="block w-full px-3 sm:px-4 py-2 bg-yellow-600 text-white text-sm sm:text-base rounded font-medium hover:bg-yellow-700 transition text-center">
							Continue
						</a>
					{:else}
						<a href={`/student/results/${assessment.id}`} class="block w-full px-3 sm:px-4 py-2 bg-green-600 text-white text-sm sm:text-base rounded font-medium hover:bg-green-700 transition text-center">
							View Result
						</a>
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	/* Tailwind handles styling */
</style>
