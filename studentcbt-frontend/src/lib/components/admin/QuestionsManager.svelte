<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';
	import { toastStore } from '$lib/stores/ui';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	export let assessmentId;

	let questions = [];
	let loading = false;
	let error = '';
	let showForm = false;
	let editingId = null;
	let bulkImportMode = false;

	let formData = {
		questionText: '',
		questionType: 'MULTIPLE_CHOICE',
		options: ['', '', ''],
		correctAnswer: '',
		marks: 1,
		explanation: '',
		orderIndex: 1
	};

	async function loadQuestions() {
		loading = true;
		try {
			const resp = await api.assessments.getById(assessmentId);
			questions = resp.assessment.questions || [];
			if (questions.length > 0) {
				formData.orderIndex = Math.max(...questions.map(q => q.orderIndex)) + 1;
			}
		} catch (err) {
			console.error('Load questions failed:', err);
			error = err.message || 'Failed to load questions';
			toastStore.error(error);
		} finally {
			loading = false;
		}
	}

	function openForm(question = null) {
		if (question) {
			editingId = question.id;
			formData = { ...question };
			if (!formData.options) formData.options = [''];
		} else {
			editingId = null;
			formData = {
				questionText: '',
				questionType: 'MULTIPLE_CHOICE',
				options: ['', '', ''],
				correctAnswer: '',
				marks: 1,
				explanation: '',
				orderIndex: questions.length + 1
			};
		}
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		editingId = null;
	}

	function addOption() {
		formData.options = [...formData.options, ''];
	}

	function removeOption(idx) {
		formData.options = formData.options.filter((_, i) => i !== idx);
	}

	async function saveQuestion() {
		if (!formData.questionText.trim()) {
			toastStore.error('Question text is required');
			return;
		}
		if (!formData.correctAnswer.trim()) {
			toastStore.error('Correct answer is required');
			return;
		}
		if (formData.questionType === 'MULTIPLE_CHOICE' && formData.options.some(o => !o.trim())) {
			toastStore.error('All options must be filled');
			return;
		}

		try {
			if (editingId) {
				await api.assessments.questions.update(editingId, formData);
				toastStore.success('Question updated successfully');
			} else {
				await api.assessments.questions.add(assessmentId, formData);
				toastStore.success('Question added successfully');
			}
			closeForm();
			loadQuestions();
		} catch (err) {
			console.error('Save question failed:', err);
			toastStore.error(err.message || 'Failed to save question');
		}
	}

	async function deleteQuestion(id) {
		if (!confirm('Are you sure you want to delete this question?')) return;

		try {
			await api.assessments.questions.delete(id);
			toastStore.success('Question deleted successfully');
			loadQuestions();
		} catch (err) {
			console.error('Delete question failed:', err);
			toastStore.error(err.message || 'Failed to delete question');
		}
	}

	function getBadgeClass(questionType) {
		const map = {
			MULTIPLE_CHOICE: 'bg-blue-100 text-blue-800',
			TRUE_FALSE: 'bg-purple-100 text-purple-800',
			FILL_BLANK: 'bg-green-100 text-green-800'
		};
		return map[questionType] || 'bg-gray-100 text-gray-800';
	}

	onMount(loadQuestions);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<h2 class="text-2xl font-bold">Questions ({questions.length})</h2>
		<div class="flex gap-2">
			<Button variant="secondary" on:click={() => bulkImportMode = true}>
				📤 Bulk Import
			</Button>
			<Button on:click={() => openForm()}>
				+ Add Question
			</Button>
		</div>
	</div>

	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	<!-- Questions List -->
	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<p class="mt-4">Loading questions...</p>
		</div>
	{:else if questions.length === 0}
		<Card>
			<div class="text-center py-12 text-gray-500">
				<p class="text-lg">No questions added yet</p>
				<Button on:click={() => openForm()} class="mt-4">Add First Question</Button>
			</div>
		</Card>
	{:else}
		<div class="space-y-3">
			{#each questions as question, idx}
				<Card class="hover:shadow-md transition">
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<div class="flex items-start gap-3">
								<div class="px-3 py-1 bg-gray-100 rounded font-bold text-sm">
									{idx + 1}
								</div>
								<div class="flex-1">
									<p class="font-semibold text-gray-900">{question.questionText}</p>
									<div class="flex gap-2 mt-2 flex-wrap">
										<Badge class={getBadgeClass(question.questionType)}>
											{question.questionType}
										</Badge>
										<Badge class="bg-gray-100 text-gray-800">
											{question.marks} mark{question.marks !== 1 ? 's' : ''}
										</Badge>
									</div>

									{#if question.questionType === 'MULTIPLE_CHOICE'}
										<div class="mt-3 text-sm">
											<p class="font-medium text-gray-700">Options:</p>
											<ul class="ml-4 mt-1 space-y-1">
												{#each question.options || [] as option}
													<li class="text-gray-600">
														• {option}
														{#if option === question.correctAnswer}
															<span class="ml-2 text-green-600 font-semibold">✓ Correct</span>
														{/if}
													</li>
												{/each}
											</ul>
										</div>
									{:else}
										<div class="mt-2 text-sm">
											<p class="font-medium text-gray-700">Correct Answer:</p>
											<p class="text-green-600 font-semibold">{question.correctAnswer}</p>
										</div>
									{/if}

									{#if question.explanation}
										<div class="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-900">
											<p class="font-medium">Explanation:</p>
											<p>{question.explanation}</p>
										</div>
									{/if}
								</div>
							</div>
						</div>

						<div class="flex gap-2">
							<Button variant="secondary" size="sm" on:click={() => openForm(question)}>
								✏️ Edit
							</Button>
							<Button variant="error" size="sm" on:click={() => deleteQuestion(question.id)}>
								🗑️ Delete
							</Button>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<!-- Question Form Modal -->
{#if showForm}
	<Modal on:close={closeForm}>
		<h3 class="text-xl font-bold mb-4">{editingId ? 'Edit Question' : 'Add Question'}</h3>

		<form on:submit|preventDefault={saveQuestion} class="space-y-4">
			<!-- Question Text -->
			<div>
				<label class="block text-sm font-medium mb-1">Question Text *</label>
				<textarea
					bind:value={formData.questionText}
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					rows="3"
					placeholder="Enter question text"
				/>
			</div>

			<!-- Question Type -->
			<div>
				<label class="block text-sm font-medium mb-1">Question Type *</label>
				<select
					bind:value={formData.questionType}
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="MULTIPLE_CHOICE">Multiple Choice</option>
					<option value="TRUE_FALSE">True/False</option>
					<option value="FILL_BLANK">Fill in the Blank</option>
				</select>
			</div>

			<!-- Options (for Multiple Choice) -->
			{#if formData.questionType === 'MULTIPLE_CHOICE'}
				<div>
					<label class="block text-sm font-medium mb-2">Options *</label>
					<div class="space-y-2">
						{#each formData.options as option, idx}
							<div class="flex gap-2">
								<input
									type="radio"
									name="correctAnswer"
									value={option}
									bind:group={formData.correctAnswer}
									class="mt-3"
								/>
								<input
									type="text"
									bind:value={formData.options[idx]}
									placeholder={`Option ${idx + 1}`}
									class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								{#if formData.options.length > 2}
									<button
										type="button"
										on:click={() => removeOption(idx)}
										class="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
									>
										Remove
									</button>
								{/if}
							</div>
						{/each}
					</div>
					<button
						type="button"
						on:click={addOption}
						class="mt-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
					>
						+ Add Option
					</button>
				</div>
			{:else}
				<div>
					<label class="block text-sm font-medium mb-1">Correct Answer *</label>
					<input
						type="text"
						bind:value={formData.correctAnswer}
						placeholder="Enter correct answer"
						class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			{/if}

			<!-- Marks -->
			<div>
				<label class="block text-sm font-medium mb-1">Marks *</label>
				<input
					type="number"
					bind:value={formData.marks}
					min="1"
					max="100"
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Explanation -->
			<div>
				<label class="block text-sm font-medium mb-1">Explanation (optional)</label>
				<textarea
					bind:value={formData.explanation}
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					rows="2"
					placeholder="Explain the correct answer (shown to students after exam)"
				/>
			</div>

			<!-- Order Index -->
			<div>
				<label class="block text-sm font-medium mb-1">Position</label>
				<input
					type="number"
					bind:value={formData.orderIndex}
					min="1"
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Buttons -->
			<div class="flex gap-2 justify-end pt-4">
				<Button variant="secondary" on:click={closeForm}>Cancel</Button>
				<Button type="submit">{editingId ? 'Update' : 'Add'} Question</Button>
			</div>
		</form>
	</Modal>
{/if}

<style>
	/* Tailwind handles styling */
</style>
