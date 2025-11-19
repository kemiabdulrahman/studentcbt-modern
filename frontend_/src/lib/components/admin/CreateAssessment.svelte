<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';
	import { createAssessmentSchema, validateForm } from '$lib/utils/validation';

	let classes = [];
	let subjects = [];
	let form = {
		title: '',
		description: '',
		subjectId: '',
		classId: '',
		duration: 30,
		passMarks: 50,
		startTime: '',
		endTime: '',
		instructions: '',
		showResults: false
	};

	let busy = false;
	let success = '';
	let error = '';
	let validationErrors = {};

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

	async function submit() {
		error = '';
		success = '';
		validationErrors = {};

		// Validate form data
		const validation = validateForm(createAssessmentSchema, {
			title: form.title,
			description: form.description,
			subjectId: form.subjectId,
			classId: form.classId,
			duration: parseInt(form.duration) || 0,
			passMarks: parseInt(form.passMarks) || 0,
			startTime: form.startTime || null,
			endTime: form.endTime || null,
			instructions: form.instructions,
			showResults: form.showResults
		});

		if (!validation.success) {
			validationErrors = validation.errors;
			error = 'Please fix the validation errors below';
			return;
		}

		busy = true;

		try {
			const payload = {
				title: form.title.trim(),
				description: form.description.trim(),
				subjectId: form.subjectId,
				classId: form.classId,
				duration: parseInt(form.duration),
				passMarks: parseInt(form.passMarks),
				startTime: form.startTime || null,
				endTime: form.endTime || null,
				instructions: form.instructions.trim(),
				showResults: form.showResults
			};

			const resp = await api.assessments.create(payload);
			success = resp.message || 'Assessment created successfully';
			
			// Reset form
			form.title = '';
			form.description = '';
			form.duration = 30;
			form.passMarks = 50;
			form.startTime = '';
			form.endTime = '';
			form.instructions = '';
			form.showResults = false;
			
			// Clear errors after success
			setTimeout(() => {
				success = '';
			}, 3000);
		} catch (err) {
			console.error('Create assessment failed', err);
			error = err.message || 'Failed to create assessment';
		} finally {
			busy = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Create New Assessment</h1>
		<p class="text-gray-600 mt-1">Set up a new assessment with questions and settings</p>
	</div>

	<!-- Status Messages -->
	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
			<span class="text-xl">⚠️</span>
			<div>
				<p class="font-semibold">Error</p>
				<p class="text-sm">{error}</p>
			</div>
		</div>
	{/if}

	{#if success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
			<span class="text-xl">✓</span>
			<div>
				<p class="font-semibold">Success</p>
				<p class="text-sm">{success}</p>
			</div>
		</div>
	{/if}

	<!-- Main Form Card -->
	<div class="bg-white rounded-lg shadow-md">
		<!-- Form Content -->
		<div class="p-6 lg:p-8">
			<form on:submit|preventDefault={submit} class="space-y-8">
				
				<!-- Basic Information Section -->
				<div class="space-y-6">
					<div class="border-b border-gray-200 pb-4">
						<h2 class="text-xl font-bold text-gray-900">📋 Basic Information</h2>
						<p class="text-sm text-gray-600 mt-1">Essential details about the assessment</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2" for="title">
								Assessment Title <span class="text-red-600">*</span>
							</label>
							<input 
								id="title"
								type="text" 
								bind:value={form.title}
								placeholder="e.g., Mathematics Final Exam"
								class="w-full px-4 py-2 border {validationErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								required
							/>
							{#if validationErrors.title}
								<p class="text-red-600 text-xs mt-1">{validationErrors.title}</p>
							{/if}
						</div>

						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2" for="class">
								Class <span class="text-red-600">*</span>
							</label>
							<select 
								id="class"
								bind:value={form.classId}
								class="w-full px-4 py-2 border {validationErrors.classId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
								required
							>
								<option value="">Select a class...</option>
								{#each classes as c}
									<option value={c.id}>{c.name}{c.stream ? ` — ${c.stream}` : ''}</option>
								{/each}
							</select>
							{#if validationErrors.classId}
								<p class="text-red-600 text-xs mt-1">{validationErrors.classId}</p>
							{/if}
						</div>

						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2" for="subject">
								Subject <span class="text-red-600">*</span>
							</label>
							<select 
								id="subject"
								bind:value={form.subjectId}
								class="w-full px-4 py-2 border {validationErrors.subjectId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
								required
							>
								<option value="">Select a subject...</option>
								{#each subjects as s}
									<option value={s.id}>{s.name}</option>
								{/each}
							</select>
							{#if validationErrors.subjectId}
								<p class="text-red-600 text-xs mt-1">{validationErrors.subjectId}</p>
							{/if}
						</div>

						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2" for="duration">
								Duration <span class="text-red-600">*</span>
							</label>
							<div class="relative">
								<input 
									id="duration"
									type="number" 
									bind:value={form.duration}
									min="5"
									max="480"
									placeholder="30"
									class="w-full px-4 py-2 border {validationErrors.duration ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
								<span class="absolute right-4 top-2.5 text-gray-500 text-sm">minutes</span>
							</div>
							{#if validationErrors.duration}
								<p class="text-red-600 text-xs mt-1">{validationErrors.duration}</p>
							{/if}
						</div>
					</div>

					<div>
						<label class="block text-sm font-semibold text-gray-700 mb-2" for="description">
							Description
						</label>
						<textarea 
							id="description"
							bind:value={form.description}
							placeholder="Brief description of the assessment..."
							rows="3"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
						></textarea>
						<p class="text-xs text-gray-500 mt-1">Optional: Provide context about this assessment</p>
					</div>
				</div>

				<!-- Assessment Settings Section -->
				<div class="space-y-6">
					<div class="border-b border-gray-200 pb-4">
						<h2 class="text-xl font-bold text-gray-900">⚙️ Assessment Settings</h2>
						<p class="text-sm text-gray-600 mt-1">Configure grading and result visibility</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2" for="pass-marks">
								Pass Mark (%) <span class="text-red-600">*</span>
							</label>
							<input 
								id="pass-marks"
								type="number" 
								bind:value={form.passMarks}
								min="0"
								max="100"
								placeholder="50"
								class="w-full px-4 py-2 border {validationErrors.passMarks ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								required
							/>
							{#if validationErrors.passMarks}
								<p class="text-red-600 text-xs mt-1">{validationErrors.passMarks}</p>
							{:else}
								<p class="text-xs text-gray-500 mt-1">Percentage needed to pass</p>
							{/if}
						</div>

						<div class="flex items-end">
							<div class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg w-full">
								<input 
									type="checkbox" 
									id="show-results"
									bind:checked={form.showResults}
									class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
								/>
								<label for="show-results" class="text-sm font-medium text-gray-700 cursor-pointer flex-1">
									Show Results to Students
								</label>
								<span class="text-xs text-gray-500">After completion</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Advanced Settings Section -->
				<div class="space-y-6">
					<div class="border-b border-gray-200 pb-4">
						<h2 class="text-xl font-bold text-gray-900">📅 Advanced Settings</h2>
						<p class="text-sm text-gray-600 mt-1">Optional: Set time windows for the assessment</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2" for="start-time">
								Start Time (Optional)
							</label>
							<input 
								id="start-time"
								type="datetime-local" 
								bind:value={form.startTime}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p class="text-xs text-gray-500 mt-1">When the assessment becomes available</p>
						</div>

						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2" for="end-time">
								End Time (Optional)
							</label>
							<input 
								id="end-time"
								type="datetime-local" 
								bind:value={form.endTime}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p class="text-xs text-gray-500 mt-1">When the assessment closes</p>
						</div>
					</div>
				</div>

				<!-- Instructions Section -->
				<div class="space-y-4">
					<div class="border-b border-gray-200 pb-4">
						<h2 class="text-xl font-bold text-gray-900">📝 Instructions</h2>
						<p class="text-sm text-gray-600 mt-1">Display these instructions to students before they start</p>
					</div>

					<textarea 
						bind:value={form.instructions}
						placeholder="Enter instructions for students (e.g., time limits, allowed resources, format requirements)..."
						rows="5"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
					></textarea>
					<p class="text-xs text-gray-500">These will be shown to students when they access the assessment</p>
				</div>

				<!-- Submit Button -->
				<div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
					<button
						type="button"
						class="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
						on:click={() => window.history.back()}
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={busy || !form.title || !form.classId || !form.subjectId}
						class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{busy ? '⏳ Creating...' : '✓ Create Assessment'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<style>
	/* simple local styles; project stylesheet may provide better visuals */
</style>
