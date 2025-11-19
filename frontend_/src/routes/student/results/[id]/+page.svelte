<script>
	import { toastStore } from '$lib/stores/ui';

	let { data } = $props();

	function getStatusColor(passed) {
		return passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
	}

	function getScoreColor(percentage, passMarks) {
		if (percentage >= passMarks) return 'text-green-700';
		return 'text-red-700';
	}
</script>

<div class="p-6 md:p-8 max-w-6xl mx-auto">
	<div class="mb-6">
		<a href="/student/results" class="text-blue-600 hover:text-blue-800 font-medium">&larr; Back to Results</a>
	</div>

	{#if data.error}
		<div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
			{data.error}
		</div>
	{/if}

	{#if data.result}
		<!-- Summary Section -->
		<div class={`rounded-lg border-l-4 p-6 mb-6 {getStatusColor(data.result.passed)}`}>
			<div class="flex justify-between items-start mb-4">
				<div>
					<h1 class="text-3xl font-bold">{data.assessment.title}</h1>
					<p class="text-gray-600 mt-2">{data.assessment.subject.name}</p>
				</div>
				<div class="text-right">
					<div class={`text-4xl font-bold {getScoreColor(data.result.percentage, data.assessment.passMarks)}`}>
						{data.result.percentage?.toFixed(1)}%
					</div>
					<div class="text-sm text-gray-600 mt-1">
						{data.result.totalScore} / {data.assessment.totalMarks} marks
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div>
					<div class="text-sm text-gray-600">Status</div>
					<div class="font-semibold">
						{#if data.result.passed}
							<span class="text-green-700">✓ Passed</span>
						{:else}
							<span class="text-red-700">✗ Failed</span>
						{/if}
					</div>
				</div>
				<div>
					<div class="text-sm text-gray-600">Pass Mark</div>
					<div class="font-semibold">{data.assessment.passMarks}%</div>
				</div>
				<div>
					<div class="text-sm text-gray-600">Questions</div>
					<div class="font-semibold">{data.assessment.questions?.length || 0}</div>
				</div>
				<div>
					<div class="text-sm text-gray-600">Attempted</div>
					<div class="font-semibold">{data.answers.length}/{data.assessment.questions?.length || 0}</div>
				</div>
			</div>
		</div>

		<!-- Detailed Answers Section -->
		<div class="space-y-6">
			<h2 class="text-2xl font-bold">Answer Review</h2>

			{#each data.answers as answer, idx}
				<div class="border rounded-lg p-6 bg-white shadow">
					<div class="flex justify-between items-start mb-4">
						<div>
							<h3 class="font-semibold text-lg">Question {idx + 1}</h3>
							<p class="text-gray-700 mt-2">{answer.question.text}</p>
						</div>
						<div class="text-right">
							<div class="text-sm text-gray-600">Marks</div>
							<div class={`text-xl font-bold {answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
								{answer.marksAwarded}/{answer.question.marks}
							</div>
						</div>
					</div>

					<div class="space-y-3 bg-gray-50 p-4 rounded">
						<!-- Student Answer -->
						<div>
							<div class="text-sm font-semibold text-gray-700">Your Answer</div>
							<div class={`p-2 rounded mt-1 {answer.isCorrect ? 'bg-green-100 text-green-900' : 'bg-yellow-100 text-yellow-900'}`}>
								{answer.studentAnswer || 'Not answered'}
							</div>
						</div>

						<!-- Correct Answer (if wrong) -->
						{#if !answer.isCorrect}
							<div>
								<div class="text-sm font-semibold text-gray-700">Correct Answer</div>
								<div class="p-2 rounded mt-1 bg-green-100 text-green-900">
									{answer.question.correctAnswer}
								</div>
							</div>
						{/if}

						<!-- Explanation -->
						{#if answer.question.explanation}
							<div>
								<div class="text-sm font-semibold text-gray-700">Explanation</div>
								<div class="p-2 rounded mt-1 bg-blue-50 text-blue-900">
									{answer.question.explanation}
								</div>
							</div>
						{/if}
					</div>

					<!-- Status Indicator -->
					<div class="mt-4">
						{#if answer.isCorrect}
							<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
								✓ Correct
							</span>
						{:else}
							<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
								✗ Incorrect
							</span>
						{/if}
					</div>
				</div>
			{/each}

			<!-- Unanswered Questions -->
			{#if (data.assessment.questions?.length || 0) > data.answers.length}
				<div class="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded text-yellow-900">
					<p class="font-semibold">Not Answered</p>
					<p class="text-sm mt-1">
						{(data.assessment.questions?.length || 0) - data.answers.length} question(s) were not answered
					</p>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="mt-8 flex gap-4">
			<a href="/student/results" class="px-6 py-2 border rounded hover:bg-gray-50 font-medium">
				Back to Results
			</a>
			<a href="/student/assessments" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
				Take Another Assessment
			</a>
		</div>
	{/if}
</div>

<style>
	/* Tailwind handles styling */
</style>
