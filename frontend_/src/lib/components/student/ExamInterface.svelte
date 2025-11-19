<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import api from '$lib/utils/api';
	import { toastStore } from '$lib/stores/ui';

	export let assessmentId = '';

	let assessment = null;
	let currentQuestion = 0;
	let answers = {};
	let timeRemaining = 0;
	let answeredQuestions = 0;
	let totalQuestions = 0;
	let error = '';
	let submitting = false;
	let timerInterval;

	$: if (assessmentId) {
		loadAssessment();
	}

	async function loadAssessment() {
		try {
			const resp = await api.student.getAssessmentForExam(assessmentId);
			assessment = resp.assessment || resp;
			totalQuestions = assessment?.questions?.length || 0;
			
			// Start the assessment attempt if not already started
			await startAssessmentAttempt();
		} catch (err) {
			console.error('Load assessment failed', err);
			error = err.message || 'Failed to load assessment';
		}
	}

	async function startAssessmentAttempt() {
		try {
			await api.student.startAssessment(assessmentId);
			// After starting, load attempt status
			await loadAttemptStatus();
		} catch (err) {
			console.error('Start assessment failed', err);
			error = err.message || 'Failed to start assessment';
		}
	}

	async function loadAttemptStatus() {
		try {
			const resp = await api.student.getAttemptStatus(assessmentId);
			timeRemaining = resp.timeRemaining || 0;
			answeredQuestions = resp.answeredQuestions || 0;
			
			if (resp.attempt?.answers && Array.isArray(resp.attempt.answers)) {
				resp.attempt.answers.forEach(ans => {
					answers[ans.questionId] = ans.answer;
				});
			}

			startTimer();
		} catch (err) {
			console.error('Load attempt status failed', err);
			error = err.message || 'Failed to load attempt status';
		}
	}

	function startTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
		timerInterval = setInterval(() => {
			timeRemaining--;
			if (timeRemaining <= 0) {
				clearInterval(timerInterval);
				submitExam();
			}
		}, 1000);
	}

	function formatTime(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	async function saveAnswer(questionId, answer) {
		answers[questionId] = answer;
		try {
			await api.student.submitAnswer(assessmentId, { questionId, answer });
			answeredQuestions = Object.keys(answers).length;
		} catch (err) {
			console.error('Save answer failed', err);
			toastStore.error('Failed to save answer');
		}
	}

	async function submitExam() {
		if (submitting) return;
		submitting = true;
		clearInterval(timerInterval);
		try {
			const resp = await api.student.submitAssessment(assessmentId);
			toastStore.success('Assessment submitted successfully');
			goto(`/student/results/${assessmentId}`);
		} catch (err) {
			console.error('Submit exam failed', err);
			error = err.message || 'Failed to submit exam';
			submitting = false;
		}
	}

	function nextQuestion() {
		if (currentQuestion < totalQuestions - 1) {
			currentQuestion++;
		}
	}

	function prevQuestion() {
		if (currentQuestion > 0) {
			currentQuestion--;
		}
	}

	onMount(() => {
		return () => {
			if (timerInterval) {
				clearInterval(timerInterval);
			}
		};
	});
</script>

{#if error}
	<div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
		{error}
	</div>
{/if}

{#if assessment}
	<div class="min-h-screen bg-gray-50 flex flex-col">
		<!-- Top Bar -->
		<div class="sticky top-0 bg-white border-b shadow-sm p-3 sm:p-4 z-10">
			<div class="max-w-full mx-auto">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
					<div class="min-w-0">
						<h1 class="text-lg sm:text-xl font-bold truncate">{assessment.title}</h1>
						<p class="text-xs sm:text-sm text-gray-600 truncate">{assessment.subject.name}</p>
					</div>
					<div class="text-right">
						<div class="text-xl sm:text-2xl font-bold text-blue-600">{formatTime(timeRemaining)}</div>
						<p class="text-xs sm:text-sm text-gray-600">Time Left</p>
					</div>
				</div>
				<div class="flex items-center gap-2 sm:gap-4">
					<div class="text-xs sm:text-sm flex-1">
						Progress: {answeredQuestions}/{totalQuestions}
					</div>
					<button 
						on:click={submitExam} 
						disabled={submitting}
						class="px-3 sm:px-4 py-1 sm:py-2 bg-red-600 text-white text-xs sm:text-sm rounded hover:bg-red-700 disabled:bg-gray-400 whitespace-nowrap"
					>
						{submitting ? 'Submitting...' : 'Submit'}
					</button>
				</div>
			</div>
		</div>

		<div class="flex-1 flex flex-col lg:flex-row max-w-full mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 gap-4 sm:gap-6">
			<!-- Questions Navigator - Hidden on mobile, sidebar on desktop -->
			<div class="hidden lg:block lg:w-48 xl:w-56">
				<div class="bg-white rounded-lg shadow p-3 sm:p-4 sticky top-24">
					<h3 class="font-bold mb-3 text-sm sm:text-base">Questions ({answeredQuestions}/{totalQuestions})</h3>
					<div class="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-1 sm:gap-2 max-h-96 overflow-y-auto">
						{#each assessment.questions as question, idx}
							<button
								on:click={() => currentQuestion = idx}
								class="w-full aspect-square rounded border-2 font-semibold text-xs sm:text-sm transition {
									currentQuestion === idx 
										? 'border-blue-600 bg-blue-50' 
										: answers[question.id] 
										? 'border-green-400 bg-green-50' 
										: 'border-gray-300 bg-gray-50'
								}"
							>
								{idx + 1}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Mobile Question Navigator -->
			<div class="lg:hidden bg-white rounded-lg shadow p-3">
				<div class="flex gap-2 items-center overflow-x-auto pb-2">
					<span class="text-xs font-medium whitespace-nowrap text-gray-600">Questions:</span>
					<div class="flex gap-1">
						{#each assessment.questions as question, idx}
							<button
								on:click={() => currentQuestion = idx}
								class="px-2 py-1 rounded border text-xs font-semibold transition {
									currentQuestion === idx 
										? 'border-blue-600 bg-blue-50' 
										: answers[question.id] 
										? 'border-green-400 bg-green-50' 
										: 'border-gray-300 bg-gray-50'
								}"
							>
								{idx + 1}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Question Display -->
			<div class="flex-1 min-w-0">
				{#if assessment.questions[currentQuestion]}
					{@const question = assessment.questions[currentQuestion]}
					<div class="bg-white rounded-lg shadow p-4 sm:p-6">
						<div class="mb-6">
							<div class="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-2">
								<h3 class="text-base sm:text-lg font-semibold">Question {currentQuestion + 1} of {totalQuestions}</h3>
								<span class="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs sm:text-sm font-medium whitespace-nowrap">
									Marks: {question.marks}
								</span>
							</div>
							<p class="text-gray-800 text-sm sm:text-base break-words">{question.questionText}</p>
						</div>

						{#if question.questionType === 'MULTIPLE_CHOICE'}
							<div class="space-y-2 sm:space-y-3 mb-6">
								{#each question.options as option}
									<label class="flex items-start p-2 sm:p-3 border-2 rounded cursor-pointer transition hover:bg-gray-50 {
										answers[question.id] === option ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
									}">
										<input 
											type="radio" 
											name={question.id}
											value={option}
											checked={answers[question.id] === option}
											on:change={() => saveAnswer(question.id, option)}
											class="w-4 h-4 mt-0.5 flex-shrink-0"
										/>
										<span class="ml-2 sm:ml-3 text-sm sm:text-base break-words">{option}</span>
									</label>
								{/each}
							</div>
						{:else if question.questionType === 'TRUE_FALSE'}
							<div class="space-y-2 sm:space-y-3 mb-6">
								{#each ['True', 'False'] as option}
									<label class="flex items-center p-2 sm:p-3 border-2 rounded cursor-pointer transition hover:bg-gray-50 {
										answers[question.id] === option ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
									}">
										<input 
											type="radio" 
											name={question.id}
											value={option}
											checked={answers[question.id] === option}
											on:change={() => saveAnswer(question.id, option)}
											class="w-4 h-4 flex-shrink-0"
										/>
										<span class="ml-2 sm:ml-3 text-sm sm:text-base">{option}</span>
									</label>
								{/each}
							</div>
						{:else if question.questionType === 'FILL_BLANK'}
							<div class="mb-6">
								<input 
									type="text"
									placeholder="Enter your answer"
									value={answers[question.id] || ''}
									on:change={(e) => saveAnswer(question.id, e.target.value)}
									class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded focus:border-blue-600 focus:outline-none"
								/>
							</div>
						{/if}

						<!-- Navigation -->
						<div class="flex gap-2 justify-between">
							<button 
								on:click={prevQuestion}
								disabled={currentQuestion === 0}
								class="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								← Previous
							</button>
							<span class="px-3 py-2 text-xs sm:text-sm text-gray-600 flex items-center">
								{currentQuestion + 1} / {totalQuestions}
							</span>
							<button 
								on:click={nextQuestion}
								disabled={currentQuestion === totalQuestions - 1}
								class="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Next →
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="text-center py-12">
		<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		<p class="mt-4 text-sm sm:text-base">Loading exam...</p>
	</div>
{/if}

<style>
	/* Tailwind handles styling */
</style>