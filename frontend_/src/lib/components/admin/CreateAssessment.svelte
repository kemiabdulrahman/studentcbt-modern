<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';

	let classes = [];
	let subjects = [];
	let form = {
		title: '',
		description: '',
		subjectId: '',
		classId: '',
		duration: 30,
		passMarks: 0,
		startTime: '',
		endTime: '',
		instructions: '',
		showResults: false
	};

	let formErrors = {};
	let busy = false;
	let success = '';
	let error = '';
	let lastSubmitTime = 0; // For rate limiting
	const MIN_SUBMIT_INTERVAL = 2000; // 2 seconds between submissions

	onMount(async () => {
		try {
			const cResp = await api.admin.classes.getAll();
			classes = cResp.classes || [];
			const sResp = await api.admin.subjects.getAll();
			subjects = sResp.subjects || [];
			if (classes.length) form.classId = classes[0].id;
			if (subjects.length) form.subjectId = subjects[0].id;
		} catch (err) {
			console.error('Failed to load classes/subjects', err);
			error = err.message || 'Failed to load data';
		}
	});

	// Client-side validation
	function validateForm() {
		formErrors = {};
		let isValid = true;

		// Title validation
		if (!form.title || form.title.trim().length === 0) {
			formErrors.title = 'Title is required';
			isValid = false;
		} else if (form.title.length < 3) {
			formErrors.title = 'Title must be at least 3 characters';
			isValid = false;
		} else if (form.title.length > 200) {
			formErrors.title = 'Title cannot exceed 200 characters';
			isValid = false;
		}

		// Class validation
		if (!form.classId) {
			formErrors.classId = 'Class is required';
			isValid = false;
		}

		// Subject validation
		if (!form.subjectId) {
			formErrors.subjectId = 'Subject is required';
			isValid = false;
		}

		// Duration validation
		if (!form.duration || form.duration < 5 || form.duration > 480) {
			formErrors.duration = 'Duration must be between 5 and 480 minutes';
			isValid = false;
		}

		// Pass marks validation
		if (form.passMarks < 0) {
			formErrors.passMarks = 'Pass marks cannot be negative';
			isValid = false;
		}

		// Date validation
		if (form.startTime && form.endTime) {
			const start = new Date(form.startTime);
			const end = new Date(form.endTime);
			if (end <= start) {
				formErrors.endTime = 'End time must be after start time';
				isValid = false;
			}
		}

		return isValid;
	}

	async function submit() {
		error = '';
		success = '';
		formErrors = {};

		// Rate limiting
		const now = Date.now();
		if (now - lastSubmitTime < MIN_SUBMIT_INTERVAL) {
			error = `Please wait ${Math.ceil((MIN_SUBMIT_INTERVAL - (now - lastSubmitTime)) / 1000)} seconds before submitting again`;
			return;
		}
		lastSubmitTime = now;

		// Validate form
		if (!validateForm()) {
			error = 'Please fix the errors below before submitting';
			return;
		}

		busy = true;

		try {
			const payload = { ...form };
			// convert empty strings to null for optional times
			if (!payload.startTime) payload.startTime = null;
			if (!payload.endTime) payload.endTime = null;
			if (!payload.instructions) payload.instructions = null;

			const resp = await api.assessments.create(payload);
			success = resp.message || 'Assessment created successfully!';
			// Reset form
			form = {
				title: '',
				description: '',
				subjectId: classes.length ? classes[0].id : '',
				classId: classes.length ? classes[0].id : '',
				duration: 30,
				passMarks: 0,
				startTime: '',
				endTime: '',
				instructions: '',
				showResults: false
			};
			// Clear success message after 3 seconds
			setTimeout(() => success = '', 3000);
		} catch (err) {
			console.error('Create assessment failed', err);
			// Check if error is from validation
			if (err.response?.data?.details) {
				// Map backend validation errors to form fields
				err.response.data.details.forEach(detail => {
					formErrors[detail.field] = detail.message;
				});
				error = 'Please fix the validation errors below';
			} else {
				error = err.message || 'Failed to create assessment';
			}
		} finally {
			busy = false;
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		submit();
	}
</script>

<div class="bg-white rounded-lg shadow">
	<div class="p-4 lg:p-6 border-b border-gray-200">
		<h3 class="text-xl font-bold text-gray-900">Create Assessment</h3>
		<p class="text-sm text-gray-600 mt-1">Add a new assessment to the system</p>
	</div>

	<div class="p-4 lg:p-6">
		{#if error}
			<div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
				<span>{error}</span>
				<button on:click={() => error = ''} class="text-red-600 hover:text-red-800">✕</button>
			</div>
		{/if}

		{#if success}
			<div class="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
				<span>{success}</span>
				<button on:click={() => success = ''} class="text-green-600 hover:text-green-800">✕</button>
			</div>
		{/if}

		<form on:submit={handleSubmit} class="space-y-4">
			<!-- Title -->
			<div>
				<label for="assessment-title" class="block text-sm font-medium text-gray-700 mb-1">
					Title <span class="text-red-600">*</span>
				</label>
				<input
					id="assessment-title"
					type="text"
					bind:value={form.title}
					placeholder="e.g., Midterm Exam - Mathematics"
					class="w-full px-3 py-2 border {formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					maxlength="200"
				/>
				{#if formErrors.title}
					<p class="mt-1 text-sm text-red-600">{formErrors.title}</p>
				{/if}
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<!-- Class -->
				<div>
					<label for="assessment-class" class="block text-sm font-medium text-gray-700 mb-1">
						Class <span class="text-red-600">*</span>
					</label>
					<select
						id="assessment-class"
						bind:value={form.classId}
						class="w-full px-3 py-2 border {formErrors.classId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					>
						<option value="">-- Select a class --</option>
						{#each classes as c}
							<option value={c.id}>{c.name}{c.stream ? ` — ${c.stream}` : ''}</option>
						{/each}
					</select>
					{#if formErrors.classId}
						<p class="mt-1 text-sm text-red-600">{formErrors.classId}</p>
					{/if}
				</div>

				<!-- Subject -->
				<div>
					<label for="assessment-subject" class="block text-sm font-medium text-gray-700 mb-1">
						Subject <span class="text-red-600">*</span>
					</label>
					<select
						id="assessment-subject"
						bind:value={form.subjectId}
						class="w-full px-3 py-2 border {formErrors.subjectId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					>
						<option value="">-- Select a subject --</option>
						{#each subjects as s}
							<option value={s.id}>{s.name}</option>
						{/each}
					</select>
					{#if formErrors.subjectId}
						<p class="mt-1 text-sm text-red-600">{formErrors.subjectId}</p>
					{/if}
				</div>
			</div>

			<!-- Description -->
			<div>
				<label for="assessment-description" class="block text-sm font-medium text-gray-700 mb-1">
					Description
				</label>
				<textarea
					id="assessment-description"
					bind:value={form.description}
					placeholder="Brief description of the assessment"
					rows="3"
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					maxlength="1000"
				></textarea>
				<p class="text-xs text-gray-500 mt-1">{form.description.length}/1000</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<!-- Duration -->
				<div>
					<label for="assessment-duration" class="block text-sm font-medium text-gray-700 mb-1">
						Duration (minutes) <span class="text-red-600">*</span>
					</label>
					<input
						id="assessment-duration"
						type="number"
						bind:value={form.duration}
						min="5"
						max="480"
						class="w-full px-3 py-2 border {formErrors.duration ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
					{#if formErrors.duration}
						<p class="mt-1 text-sm text-red-600">{formErrors.duration}</p>
					{/if}
				</div>

				<!-- Pass Marks -->
				<div>
					<label for="assessment-passmarks" class="block text-sm font-medium text-gray-700 mb-1">
						Pass Marks (out of total)
					</label>
					<input
						id="assessment-passmarks"
						type="number"
						bind:value={form.passMarks}
						min="0"
						class="w-full px-3 py-2 border {formErrors.passMarks ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
					{#if formErrors.passMarks}
						<p class="mt-1 text-sm text-red-600">{formErrors.passMarks}</p>
					{/if}
				</div>
			</div>

			<!-- Time Range -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label for="assessment-starttime" class="block text-sm font-medium text-gray-700 mb-1">
						Start Time (Optional)
					</label>
					<input
						id="assessment-starttime"
						type="datetime-local"
						bind:value={form.startTime}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<div>
					<label for="assessment-endtime" class="block text-sm font-medium text-gray-700 mb-1">
						End Time (Optional)
					</label>
					<input
						id="assessment-endtime"
						type="datetime-local"
						bind:value={form.endTime}
						class="w-full px-3 py-2 border {formErrors.endTime ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
					{#if formErrors.endTime}
						<p class="mt-1 text-sm text-red-600">{formErrors.endTime}</p>
					{/if}
				</div>
			</div>

			<!-- Instructions -->
			<div>
				<label for="assessment-instructions" class="block text-sm font-medium text-gray-700 mb-1">
					Instructions
				</label>
				<textarea
					id="assessment-instructions"
					bind:value={form.instructions}
					placeholder="Special instructions for students taking this assessment"
					rows="4"
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					maxlength="2000"
				></textarea>
				<p class="text-xs text-gray-500 mt-1">{form.instructions.length}/2000</p>
			</div>

			<!-- Show Results Checkbox -->
			<div class="flex items-center gap-2">
				<input
					id="assessment-showresults"
					type="checkbox"
					bind:checked={form.showResults}
					class="w-4 h-4 rounded text-blue-600 cursor-pointer"
				/>
				<label for="assessment-showresults" class="text-sm text-gray-700 cursor-pointer">
					Show results to students after submission
				</label>
			</div>

			<!-- Submit Button -->
			<div class="flex gap-2 pt-4">
				<button
					type="submit"
					disabled={busy}
					class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{busy ? 'Creating Assessment...' : 'Create Assessment'}
				</button>
				<button
					type="button"
					on:click={() => {
						form = {
							title: '',
							description: '',
							subjectId: classes.length ? classes[0].id : '',
							classId: classes.length ? classes[0].id : '',
							duration: 30,
							passMarks: 0,
							startTime: '',
							endTime: '',
							instructions: '',
							showResults: false
						};
						formErrors = {};
						error = '';
						success = '';
					}}
					class="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
				>
					Reset
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	/* Styles handled by Tailwind */
</style>
