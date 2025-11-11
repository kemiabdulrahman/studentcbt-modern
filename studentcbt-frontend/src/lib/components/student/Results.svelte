<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';
	import { toastStore } from '$lib/stores/ui';

	export let assessmentId = '';

	let attempt = null;
	let error = '';
	let loading = false;

	async function loadResult() {
		loading = true;
		try {
			const resp = await api.student.getDetailedResult(assessmentId);
			attempt = resp.attempt || resp;
		} catch (err) {
			console.error('Load result failed', err);
			error = err.message || 'Failed to load result. Results may not be available yet.';
			toastStore.error(error);
		} finally {
			loading = false;
		}
	}

	function getGradeColor(percentage) {
		if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300';
		if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		return 'bg-red-100 text-red-800 border-red-300';
	}

	function getAnswerStatus(answer) {
		return answer.isCorrect 
			? { label: 'Correct', color: 'text-green-600 bg-green-50' }
			: { label: 'Incorrect', color: 'text-red-600 bg-red-50' };
	}

	onMount(loadResult);
</script>

{#if loading}
	<div class="text-center py-12">
		<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		<p class="mt-4 text-sm sm:text-base">Loading result...</p>
	</div>
{:else if error}
	<div class="max-w-3xl mx-auto p-4 sm:p-6">
		<div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
			{error}
		</div>
		<a href="/student/results" class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base">
			Back to Results
		</a>
	</div>
{:else if attempt}
	<div class="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
		<!-- Summary Card -->
		<div class="bg-white rounded-lg shadow p-4 sm:p-8">
			<div class="text-center mb-6">
				<h1 class="text-2xl sm:text-3xl font-bold mb-2">{attempt.assessment.title}</h1>
				<p class="text-sm sm:text-base text-gray-600">{attempt.assessment.subject.name}</p>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-8">
				<div class="text-center p-3 sm:p-4 bg-blue-50 rounded">
					<div class="text-xl sm:text-2xl font-bold text-blue-600">{attempt.totalScore}</div>
					<div class="text-xs sm:text-sm text-gray-600">Score</div>
				</div>
				<div class="text-center p-3 sm:p-4 bg-purple-50 rounded">
					<div class="text-xl sm:text-2xl font-bold text-purple-600">{attempt.assessment.totalMarks}</div>
					<div class="text-xs sm:text-sm text-gray-600">Total</div>
				</div>
				<div class="text-center p-3 sm:p-4 {getGradeColor(attempt.percentage)} border rounded">
					<div class="text-xl sm:text-2xl font-bold">{attempt.percentage?.toFixed(1)}%</div>
					<div class="text-xs sm:text-sm">Percentage</div>
				</div>
				<div class="text-center p-3 sm:p-4 bg-indigo-50 rounded">
					<div class="text-sm sm:text-lg font-bold text-indigo-600 break-words">{attempt.status}</div>
					<div class="text-xs sm:text-sm text-gray-600">Status</div>
				</div>
			</div>

			{#if attempt.percentage >= attempt.assessment.passMarks}
				<div class="p-3 sm:p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center font-semibold text-sm sm:text-base">
					✓ You passed this assessment!
				</div>
			{:else}
				<div class="p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center font-semibold text-sm sm:text-base">
					✗ You did not pass this assessment
				</div>
			{/if}
		</div>

		<!-- Answers Review -->
		<div class="bg-white rounded-lg shadow p-4 sm:p-8">
			<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Answers Review</h2>
			
			<div class="space-y-3 sm:space-y-4">
				{#each attempt.answers as answer, idx}
					{@const status = getAnswerStatus(answer)}
					<div class="border rounded-lg p-3 sm:p-4">
						<div class="flex flex-col sm:flex-row justify-between gap-2 mb-3">
							<div class="flex-1 min-w-0">
								<h4 class="font-semibold text-sm sm:text-base mb-1">Question {answer.question.orderIndex}</h4>
								<p class="text-gray-700 text-sm sm:text-base break-words">{answer.question.questionText}</p>
							</div>
							<div class="text-right flex-shrink-0">
								<span class="inline-block px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium {status.color} whitespace-nowrap">
									{status.label}
								</span>
								<div class="text-base sm:text-lg font-bold text-gray-700 mt-1">{answer.marksAwarded}/{answer.question.marks}</div>
							</div>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							<div>
								<p class="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Your Answer</p>
								<p class="bg-gray-50 p-2 sm:p-3 rounded text-sm break-words">{answer.answer || 'Not answered'}</p>
							</div>
							<div>
								<p class="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Correct Answer</p>
								<p class="bg-green-50 p-2 sm:p-3 rounded text-sm break-words">{answer.question.correctAnswer}</p>
							</div>
						</div>

						{#if answer.question.explanation}
							<div class="mt-3 p-3 sm:p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
								<p class="text-xs sm:text-sm font-semibold text-blue-900 mb-1">Explanation</p>
								<p class="text-blue-800 text-sm break-words">{answer.question.explanation}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="text-center">
			<a href="/student/results" class="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base">
				Back to Results
			</a>
		</div>
	</div>
{/if}

<style>
	/* Tailwind handles styling */
</style>
