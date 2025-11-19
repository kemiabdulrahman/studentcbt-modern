<script>
	import { page } from '$app/stores';
	import api from '$lib/utils/api';
	import { toastStore } from '$lib/stores/ui';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Table from '$lib/components/ui/Table.svelte';

	let { data } = $props();

	let assessment = $state(data?.assessment || null);
	let results = $state(data?.results || []);
	let statistics = $state(data?.statistics || {});
	let pagination = $state(data?.pagination || {});
	let pageNum = $state(1);
	let limit = $state(10);
	let error = $state(data?.error || '');

	let assessmentId = $derived($page.params.id);

	let loadData = async () => {
		try {
			const [assessResp, resultsResp] = await Promise.all([
				api.assessments.getById(assessmentId),
				api.assessments.getResults(assessmentId, { page: pageNum, limit })
			]);
			assessment = assessResp.assessment;
			results = resultsResp.results || [];
			statistics = resultsResp.statistics || {};
			pagination = resultsResp.pagination || {};
		} catch (err) {
			console.error('Load results failed:', err);
			error = err.message || 'Failed to load results';
			toastStore.error(error);
		}
	};

	function getScoreColor(score, passMarks) {
		const percentage = (score / assessment.totalMarks) * 100;
		if (percentage >= passMarks) return 'text-green-700 bg-green-50';
		return 'text-red-700 bg-red-50';
	}

	function getStatusBadge(score, passMarks) {
		const percentage = (score / assessment.totalMarks) * 100;
		if (percentage >= passMarks) return { text: 'Pass', color: 'bg-green-100 text-green-800' };
		return { text: 'Fail', color: 'bg-red-100 text-red-800' };
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<a href="/admin/assessments/{assessmentId}" class="text-blue-600 hover:text-blue-800 font-medium">
			&larr; Back to Assessment
		</a>
		<h1 class="text-3xl font-bold mt-2">Assessment Results</h1>
		<p class="text-gray-600 mt-1">{assessment?.title}</p>
	</div>

	{#if error}
		<Card class="border border-red-200 bg-red-50">
			<p class="text-red-700">{error}</p>
		</Card>
	{/if}

	{#if assessment}
		<!-- Statistics Cards -->
		<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-blue-600">{statistics.totalAttempts || 0}</div>
					<div class="text-sm text-gray-600">Total Attempts</div>
				</div>
			</Card>
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600">{statistics.passCount || 0}</div>
					<div class="text-sm text-gray-600">Passed</div>
				</div>
			</Card>
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-red-600">{statistics.failCount || 0}</div>
					<div class="text-sm text-gray-600">Failed</div>
				</div>
			</Card>
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-purple-600">
						{statistics.averageScore ? statistics.averageScore.toFixed(1) : 0}
					</div>
					<div class="text-sm text-gray-600">Average Score</div>
				</div>
			</Card>
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-indigo-600">
						{statistics.highestScore || 0}
					</div>
					<div class="text-sm text-gray-600">Highest Score</div>
				</div>
			</Card>
		</div>

		<!-- Results Table -->
		{#if results.length === 0}
			<Card>
				<div class="text-center py-12 text-gray-500">
					<p class="text-lg">No attempts yet</p>
				</div>
			</Card>
		{:else}
			<Card class="overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-100 border-b">
							<tr>
								<th class="px-6 py-3 text-left font-semibold">Student</th>
								<th class="px-6 py-3 text-center font-semibold">Score</th>
								<th class="px-6 py-3 text-center font-semibold">Percentage</th>
								<th class="px-6 py-3 text-center font-semibold">Status</th>
								<th class="px-6 py-3 text-center font-semibold">Submitted</th>
								<th class="px-6 py-3 text-center font-semibold">Action</th>
							</tr>
						</thead>
						<tbody>
							{#each results as attempt}
								{@const statusBadge = getStatusBadge(attempt.totalScore, assessment.passMarks)}
								{@const percentage = ((attempt.totalScore / assessment.totalMarks) * 100).toFixed(1)}
								<tr class="border-b hover:bg-gray-50 transition">
									<td class="px-6 py-4">
										<div class="font-medium">{attempt.student?.firstName} {attempt.student?.lastName}</div>
										<div class="text-sm text-gray-600">{attempt.student?.studentId}</div>
									</td>
									<td class="px-6 py-4 text-center font-semibold {getScoreColor(attempt.totalScore, assessment.passMarks)}">
										{attempt.totalScore} / {assessment.totalMarks}
									</td>
									<td class="px-6 py-4 text-center font-semibold">
										<span class={getScoreColor(attempt.totalScore, assessment.passMarks)}>
											{percentage}%
										</span>
									</td>
									<td class="px-6 py-4 text-center">
										<Badge class={statusBadge.color}>
											{statusBadge.text}
										</Badge>
									</td>
									<td class="px-6 py-4 text-center text-sm">
										{#if attempt.submittedAt}
											{new Date(attempt.submittedAt).toLocaleDateString()}
											<br />
											<span class="text-gray-600">{new Date(attempt.submittedAt).toLocaleTimeString()}</span>
										{:else}
											—
										{/if}
									</td>
									<td class="px-6 py-4 text-center">
										<a href="/admin/assessments/{assessmentId}/results/{attempt.student.id}" class="text-blue-600 hover:text-blue-800 font-medium">
											View Details
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>

			<!-- Pagination -->
			{#if pagination.pages > 1}
				<div class="flex justify-center gap-2">
					<Button 
						variant="secondary"
						disabled={pageNum === 1}
						on:click={() => { pageNum--; loadData(); }}
					>
						Previous
					</Button>
					<div class="flex items-center gap-2">
						{#each Array(pagination.pages) as _, idx}
							<button 
								on:click={() => { pageNum = idx + 1; loadData(); }}
								class="px-3 py-2 rounded border {pageNum === idx + 1 ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}"
							>
								{idx + 1}
							</button>
						{/each}
					</div>
					<Button 
						variant="secondary"
						disabled={pageNum === pagination.pages}
						on:click={() => { pageNum++; loadData(); }}
					>
						Next
					</Button>
				</div>
			{/if}
		{/if}
	{/if}
</div>

<style>
	/* Tailwind handles styling */
</style>
