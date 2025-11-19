<script>
	import { page } from '$app/stores';
	import api from '$lib/utils/api';
	import { toastStore } from '$lib/stores/ui';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let { data } = $props();

	let attempt = data?.attempt || null;
	let error = data?.error || '';

	let assessmentId = $derived($page.params.id);
	let studentId = $derived($page.params.studentId);

	function getScoreColor(percentage, passMarks) {
		if (percentage >= passMarks) return 'text-green-700';
		return 'text-red-700';
	}

	function getGradeBackground(percentage, passMarks) {
		if (percentage >= passMarks) return 'bg-green-50 border-green-200';
		return 'bg-red-50 border-red-200';
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<a href="/admin/assessments/{assessmentId}/results" class="text-blue-600 hover:text-blue-800 font-medium">
			&larr; Back to Results
		</a>
		<h1 class="text-3xl font-bold mt-2">Student Attempt Details</h1>
	</div>

	{#if error}
		<Card class="border border-red-200 bg-red-50">
			<p class="text-red-700">{error}</p>
		</Card>
	{/if}

	{#if attempt}
		<!-- Student & Assessment Info -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card>
				<h3 class="font-bold mb-3">Student Information</h3>
				<div class="space-y-2 text-sm">
					<div>
						<span class="text-gray-600">Name:</span>
						<span class="font-semibold">{attempt.student?.firstName} {attempt.student?.lastName}</span>
					</div>
					<div>
						<span class="text-gray-600">Student ID:</span>
						<span class="font-semibold">{attempt.student?.studentId}</span>
					</div>
				</div>
			</Card>

			<Card>
				<h3 class="font-bold mb-3">Assessment Information</h3>
				<div class="space-y-2 text-sm">
					<div>
						<span class="text-gray-600">Assessment:</span>
						<span class="font-semibold">{attempt.assessment?.title}</span>
					</div>
					<div>
						<span class="text-gray-600">Pass Marks:</span>
						<span class="font-semibold">{attempt.assessment?.passMarks}%</span>
					</div>
					<div>
						<span class="text-gray-600">Total Marks:</span>
						<span class="font-semibold">{attempt.assessment?.totalMarks}</span>
					</div>
				</div>
			</Card>
		</div>

		<!-- Score Summary -->
		{@const percentage = ((attempt.totalScore / attempt.assessment.totalMarks) * 100).toFixed(1)}
		{@const passed = percentage >= attempt.assessment.passMarks}
		<div class={`border-l-4 rounded-lg p-6 ${getGradeBackground(percentage, attempt.assessment.passMarks)}`}>
			<div class="flex justify-between items-start">
				<div>
					<h3 class="font-bold mb-2">Result Summary</h3>
					<div class="space-y-1 text-sm">
						<div>
							<span class="text-gray-700">Score:</span>
							<span class={`font-bold ${getScoreColor(percentage, attempt.assessment.passMarks)}`}>
								{attempt.totalScore} / {attempt.assessment.totalMarks}
							</span>
						</div>
						<div>
							<span class="text-gray-700">Percentage:</span>
							<span class={`font-bold ${getScoreColor(percentage, attempt.assessment.passMarks)}`}>
								{percentage}%
							</span>
						</div>
						<div>
							<span class="text-gray-700">Status:</span>
							<span class={`font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
								{passed ? '✓ PASSED' : '✗ FAILED'}
							</span>
						</div>
					</div>
				</div>
				<div class={`px-4 py-2 rounded text-center ${passed ? 'bg-green-200' : 'bg-red-200'}`}>
					<div class={`text-3xl font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
						{percentage}%
					</div>
					<div class={`text-xs font-semibold ${passed ? 'text-green-700' : 'text-red-700'}`}>
						{passed ? 'PASS' : 'FAIL'}
					</div>
				</div>
			</div>
		</div>

		<!-- Answer Review -->
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Answer Review</h2>

			{#each attempt.answers as answer, idx}
				{@const isCorrect = answer.isCorrect}
				<Card class={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
					<div class="space-y-3">
						<!-- Question -->
						<div>
							<div class="flex justify-between items-start gap-3">
								<div>
									<div class="font-bold text-lg">Question {idx + 1}</div>
									<p class="text-gray-900 mt-1">{answer.question?.questionText}</p>
								</div>
								<div class={`px-3 py-1 rounded font-bold text-sm whitespace-nowrap ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
									{answer.marksAwarded}/{answer.question?.marks}
								</div>
							</div>
						</div>

						<!-- Student Answer -->
						<div class="bg-gray-50 p-3 rounded">
							<p class="text-sm font-semibold text-gray-700">Student's Answer</p>
							<p class={`mt-1 p-2 rounded ${isCorrect ? 'bg-green-100 text-green-900' : 'bg-yellow-100 text-yellow-900'}`}>
								{answer.studentAnswer || '(Not answered)'}
							</p>
						</div>

						<!-- Correct Answer (if wrong) -->
						{#if !isCorrect}
							<div class="bg-gray-50 p-3 rounded">
								<p class="text-sm font-semibold text-gray-700">Correct Answer</p>
								<p class="mt-1 p-2 rounded bg-green-100 text-green-900">
									{answer.question?.correctAnswer}
								</p>
							</div>
						{/if}

						<!-- Explanation -->
						{#if answer.question?.explanation}
							<div class="bg-blue-50 border border-blue-200 p-3 rounded">
								<p class="text-sm font-semibold text-blue-900">Explanation</p>
								<p class="mt-1 text-blue-900 text-sm">
									{answer.question.explanation}
								</p>
							</div>
						{/if}

						<!-- Status -->
						<div class="flex items-center gap-2 pt-2">
							{#if isCorrect}
								<Badge class="bg-green-100 text-green-800">✓ Correct</Badge>
							{:else}
								<Badge class="bg-red-100 text-red-800">✗ Incorrect</Badge>
							{/if}
						</div>
					</div>
				</Card>
			{/each}
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2">
			<Button variant="secondary" on:click={() => window.history.back()}>
				Back to Results
			</Button>
		</div>
	{/if}
</div>

<style>
	/* Tailwind handles styling */
</style>
