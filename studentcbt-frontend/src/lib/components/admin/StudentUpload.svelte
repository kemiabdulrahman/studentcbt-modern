<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';

	let classes = [];
	let selectedClass = '';
	let file = null;
	let validation = null;
	let uploading = false;
	let message = '';
	let error = '';

	onMount(async () => {
		try {
			const resp = await api.admin.classes.getAll();
			classes = resp.classes || [];
			if (classes.length > 0) selectedClass = classes[0].id;
		} catch (err) {
			console.error('Failed to load classes', err);
			error = err.message || 'Failed to load classes';
		}
	});

	function handleFileChange(e) {
		validation = null;
		message = '';
		error = '';
		const f = e.target.files && e.target.files[0];
		if (f) file = f; else file = null;
	}

	async function validateFile() {
		if (!file) {
			error = 'Please choose a file to validate';
			return;
		}

		try {
			validation = null;
			error = '';
			const resp = await api.upload.validateStudents(file);
			validation = resp.data || resp; // api returns {data: {...}} sometimes
		} catch (err) {
			console.error('Validation failed', err);
			error = err.message || 'Validation failed';
		}
	}

	async function uploadFile() {
		if (!file) {
			error = 'Please choose a file to upload';
			return;
		}

		if (!selectedClass) {
			error = 'Please select a class';
			return;
		}

		uploading = true;
		message = '';
		error = '';

		try {
			const resp = await api.upload.uploadStudents(selectedClass, file);
			message = resp.message || 'Upload completed';
			if (resp.summary) {
				message += ` — created: ${resp.summary.created}, errors: ${resp.summary.errors}`;
			}
			// Reset file input
			file = null;
			// clear the input element value by dispatching an event (component consumer may reset)
			const input = document.getElementById('student-file-input');
			if (input) input.value = '';
		} catch (err) {
			console.error('Upload failed', err);
			error = err.message || 'Upload failed';
		} finally {
			uploading = false;
		}
	}
</script>

<div class="p-4 bg-white rounded shadow">
	<h3 class="text-lg font-semibold mb-3">Student Bulk Upload</h3>

	{#if error}
		<div class="mb-3 text-red-600">{error}</div>
	{/if}

	{#if message}
		<div class="mb-3 text-green-700">{message}</div>
	{/if}

	<div class="mb-3">
		<label class="block mb-1">Target Class</label>
		<select bind:value={selectedClass} class="border px-2 py-1 w-full">
			<option value="">-- Select class --</option>
			{#each classes as c}
				<option value={c.id}>{c.name}{c.stream ? ` — ${c.stream}` : ''}</option>
			{/each}
		</select>
	</div>

	<div class="mb-3">
		<label class="block mb-1">Student file (xlsx, xls or csv, max 5MB)</label>
		<input id="student-file-input" type="file" accept=".xlsx,.xls,.csv" on:change={handleFileChange} />
	</div>

	<div class="flex gap-2 mb-4">
		<button class="px-3 py-1 bg-blue-600 text-white rounded" on:click={validateFile} disabled={!file}>Validate</button>
		<button class="px-3 py-1 bg-green-600 text-white rounded" on:click={uploadFile} disabled={!file || !selectedClass || uploading}>{uploading ? 'Uploading…' : 'Upload'}</button>
	</div>

	{#if validation}
		<div class="border p-3 rounded">
			<h4 class="font-medium">Validation Summary</h4>
			{#if validation.summary}
				<div class="text-sm text-gray-700">Total rows: {validation.summary.totalRows} — Valid: {validation.summary.validRows} — Errors: {validation.summary.errorRows}</div>
			{/if}

			{#if validation.conflicts}
				<div class="mt-2 text-sm text-orange-700">Conflicts found: {validation.conflicts.studentIds?.length || 0} studentIds, {validation.conflicts.emails?.length || 0} emails</div>
			{/if}

			{#if validation.previewStudents}
				<div class="mt-2">
					<h5 class="font-semibold">Preview</h5>
					<ul class="text-sm list-disc ml-5">
						{#each validation.previewStudents as s}
							<li>{s.studentId} — {s.firstName} {s.lastName} — {s.email}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if validation.details && validation.details.errors && validation.details.errors.length > 0}
				<div class="mt-3">
					<h5 class="font-semibold text-red-700">Row errors</h5>
					<ul class="text-sm list-disc ml-5 text-red-600">
						{#each validation.details.errors as e}
							<li>Row {e.row}: {e.errors.join('; ')}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Minimal local styles, project-level Tailwind may override */
</style>
