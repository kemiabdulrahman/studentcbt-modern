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
	let bulkImportStep = 'format'; // 'format', 'preview', 'uploading'
	let bulkFile = null;
	let bulkQuestions = [];
	let bulkImportError = '';
	let bulkImporting = false;

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

	// Bulk import functions
	function parseCSV(csvText) {
		const lines = csvText.split('\n').filter(line => line.trim());
		if (lines.length < 2) {
			throw new Error('CSV file must have at least a header row and one data row');
		}

		const header = lines[0].split(',').map(h => h.trim().toLowerCase());
		const requiredFields = ['questiontext', 'questiontype', 'correctanswer'];
		const missingFields = requiredFields.filter(f => !header.includes(f));
		
		if (missingFields.length > 0) {
			throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
		}

		const parsed = [];
		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(',').map(v => v.trim());
			if (values.every(v => !v)) continue; // Skip empty lines

			const row = {};
			header.forEach((h, idx) => {
				row[h] = values[idx] || '';
			});

			const question = {
				questionText: row.questiontext,
				questionType: row.questiontype?.toUpperCase() || 'MULTIPLE_CHOICE',
				correctAnswer: row.correctanswer,
				marks: parseInt(row.marks) || 1,
				explanation: row.explanation || '',
				options: row.questiontype?.toUpperCase() === 'MULTIPLE_CHOICE' 
					? [row.option1, row.option2, row.option3, row.option4].filter(o => o)
					: undefined
			};

			// Validate
			if (!question.questionText) throw new Error(`Row ${i + 1}: Question text is required`);
			if (!['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK'].includes(question.questionType)) {
				throw new Error(`Row ${i + 1}: Invalid question type`);
			}
			if (!question.correctAnswer) throw new Error(`Row ${i + 1}: Correct answer is required`);
			if (question.questionType === 'MULTIPLE_CHOICE' && question.options.length < 2) {
				throw new Error(`Row ${i + 1}: Multiple choice requires at least 2 options`);
			}

			parsed.push(question);
		}

		return parsed;
	}

	function parseJSON(jsonText) {
		try {
			const data = JSON.parse(jsonText);
			if (!Array.isArray(data)) {
				throw new Error('JSON must be an array of questions');
			}
			return data;
		} catch (err) {
			throw new Error(`Invalid JSON: ${err.message}`);
		}
	}

	function handleBulkFileSelect(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		bulkFile = file;
		bulkImportError = '';
		bulkQuestions = [];

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target.result;
				const ext = file.name.split('.').pop().toLowerCase();

				if (ext === 'csv') {
					bulkQuestions = parseCSV(text);
				} else if (ext === 'json') {
					bulkQuestions = parseJSON(text);
				} else {
					bulkImportError = 'Unsupported file format. Please use CSV or JSON.';
					return;
				}

				bulkImportStep = 'preview';
			} catch (err) {
				bulkImportError = err.message;
			}
		};

		reader.onerror = () => {
			bulkImportError = 'Failed to read file';
		};

		reader.readAsText(file);
	}

	async function confirmBulkImport() {
		if (bulkQuestions.length === 0) {
			bulkImportError = 'No questions to import';
			return;
		}

		bulkImporting = true;
		bulkImportError = '';

		try {
			await api.assessments.questions.addBulk(assessmentId, bulkQuestions);
			toastStore.success(`${bulkQuestions.length} questions imported successfully`);
			closeBulkImport();
			loadQuestions();
		} catch (err) {
			console.error('Bulk import failed:', err);
			bulkImportError = err.message || 'Failed to import questions';
		} finally {
			bulkImporting = false;
		}
	}

	function closeBulkImport() {
		bulkImportMode = false;
		bulkImportStep = 'format';
		bulkFile = null;
		bulkQuestions = [];
		bulkImportError = '';
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


<Modal 
	open={showForm}
	on:close={closeForm}
	title={editingId ? 'Edit Question' : 'Add Question'}
>
	<form on:submit|preventDefault={saveQuestion} class="space-y-4">
		<!-- Question Text -->
		<div>
			<label class="block text-sm font-medium mb-1" for="question-text">Question Text *</label>
			<textarea
				id="question-text"
				bind:value={formData.questionText}
				class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				rows="3"
				placeholder="Enter question text"
			></textarea>
		</div>

		<!-- Question Type -->
		<div>
			<label class="block text-sm font-medium mb-1" for="question-type">Question Type *</label>
			<select
				id="question-type"
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
				<label class="block text-sm font-medium mb-1" for="correct-answer">Correct Answer *</label>
				<input
					id="correct-answer"
					type="text"
					bind:value={formData.correctAnswer}
					placeholder="Enter correct answer"
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		{/if}

		<!-- Marks -->
		<div>
			<label class="block text-sm font-medium mb-1" for="marks">Marks *</label>
			<input
				id="marks"
				type="number"
				bind:value={formData.marks}
				min="1"
				max="100"
				class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<!-- Explanation -->
		<div>
			<label class="block text-sm font-medium mb-1" for="explanation">Explanation (optional)</label>
			<textarea
				id="explanation"
				bind:value={formData.explanation}
				class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				rows="2"
				placeholder="Explain the correct answer (shown to students after exam)"
			></textarea>
		</div>

		<!-- Order Index -->
		<div>
			<label class="block text-sm font-medium mb-1" for="order-index">Position</label>
			<input
				id="order-index"
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

<!-- Bulk Import Modal -->
<Modal 
	open={bulkImportMode}
	on:close={closeBulkImport}
	title="📤 Bulk Import Questions"
>
	<div>
		{#if bulkImportStep === 'format'}
			<div class="space-y-4">
				<Alert type="info">
					Import multiple questions at once using CSV or JSON file format
				</Alert>

				<div class="space-y-3">
					<div>
						<h4 class="font-semibold mb-2">CSV Format</h4>
						<p class="text-sm text-gray-600 mb-2">Required columns: questionText, questionType, correctAnswer, marks (optional)</p>
						<p class="text-sm text-gray-600 mb-2">For multiple choice, use: option1, option2, option3, option4</p>
						<div class="bg-gray-50 p-3 rounded text-xs font-mono mb-2 overflow-auto">
questionText,questionType,correctAnswer,marks,explanation,option1,option2,option3
What is 2+2?,MULTIPLE_CHOICE,4,1,The sum of 2 and 2,3,4,5
True or False: Sky is blue,TRUE_FALSE,True,1,,
What is capital of France?,FILL_BLANK,Paris,1,The capital city
						</div>
					</div>

					<div>
						<h4 class="font-semibold mb-2">JSON Format</h4>
						<p class="text-sm text-gray-600 mb-2">Array of question objects with required fields</p>
						<div class="bg-gray-50 p-3 rounded text-xs font-mono mb-2 overflow-auto">
							<div>Required: questionText, questionType, correctAnswer</div>
							<div>Optional: marks, explanation, options</div>
							<div class="mt-2 text-gray-500">Upload file to see example</div>
						</div>
					</div>
				</div>

				<div class="border-t pt-4">
					<label class="block text-sm font-medium mb-2" for="bulk-file">Select File</label>
					<input 
						id="bulk-file"
						type="file" 
						accept=".csv,.json"
						on:change={handleBulkFileSelect}
						class="block w-full text-sm text-gray-500
							file:mr-4 file:py-2 file:px-4
							file:rounded-lg file:border-0
							file:text-sm file:font-semibold
							file:bg-blue-50 file:text-blue-700
							hover:file:bg-blue-100"
					/>
				</div>

				{#if bulkImportError}
					<Alert type="error">{bulkImportError}</Alert>
				{/if}
			</div>
		{:else if bulkImportStep === 'preview'}
			<div class="space-y-4">
				<h3 class="text-lg font-bold">Preview ({bulkQuestions.length} questions)</h3>
				
				{#if bulkImportError}
					<Alert type="error">{bulkImportError}</Alert>
				{/if}

				<div class="space-y-3 max-h-96 overflow-y-auto">
					{#each bulkQuestions as q, idx}
						<div class="border rounded p-3 bg-gray-50">
							<div class="flex gap-2 mb-2">
								<span class="font-bold text-sm">{idx + 1}.</span>
								<div class="flex-1">
									<p class="font-medium text-sm">{q.questionText}</p>
									<div class="flex gap-2 mt-1">
										<Badge class={getBadgeClass(q.questionType)}>
											{q.questionType}
										</Badge>
										<Badge class="bg-gray-100 text-gray-800">
											{q.marks} mark{q.marks !== 1 ? 's' : ''}
										</Badge>
									</div>
									{#if q.questionType === 'MULTIPLE_CHOICE'}
										<div class="text-xs mt-1 text-gray-600">
											Options: {q.options?.join(', ')}
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>

				<div class="flex gap-2 justify-end pt-4 border-t">
					<Button variant="secondary" on:click={() => bulkImportStep = 'format'}>
						← Back
					</Button>
					<Button 
						on:click={confirmBulkImport}
						disabled={bulkImporting}
					>
						{bulkImporting ? 'Importing...' : '✓ Import All'}
					</Button>
				</div>
			</div>
		{/if}
	</div>
</Modal>

<style>
	/* Tailwind handles styling */
</style>