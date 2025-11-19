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

	let busy = false;
	let success = '';
	let error = '';

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
		busy = true;

		try {
			const payload = { ...form };
			// convert empty strings to null for optional times
			if (!payload.startTime) payload.startTime = null;
			if (!payload.endTime) payload.endTime = null;

			const resp = await api.assessments.create(payload);
			success = resp.message || 'Assessment created';
			// Reset basic fields
			form.title = '';
			form.description = '';
		} catch (err) {
			console.error('Create assessment failed', err);
			error = err.message || 'Failed to create assessment';
		} finally {
			busy = false;
		}
	}
</script>

<div class="p-4 bg-white rounded shadow">
	<h3 class="text-lg font-semibold mb-3">Create Assessment</h3>

	{#if error}
		<div class="mb-3 text-red-600">{error}</div>
	{/if}

	{#if success}
		<div class="mb-3 text-green-700">{success}</div>
	{/if}

	<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
		<div>
			<label class="block mb-1">Title</label>
			<input class="border px-2 py-1 w-full" bind:value={form.title} />
		</div>

		<div>
			<label class="block mb-1">Class</label>
			<select class="border px-2 py-1 w-full" bind:value={form.classId}>
				{#each classes as c}
					<option value={c.id}>{c.name}{c.stream ? ` — ${c.stream}` : ''}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block mb-1">Subject</label>
			<select class="border px-2 py-1 w-full" bind:value={form.subjectId}>
				{#each subjects as s}
					<option value={s.id}>{s.name}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block mb-1">Duration (minutes)</label>
			<input type="number" class="border px-2 py-1 w-full" bind:value={form.duration} min="5" />
		</div>

		<div class="md:col-span-2">
			<label class="block mb-1">Description</label>
			<textarea class="border px-2 py-1 w-full" rows="3" bind:value={form.description}></textarea>
		</div>

		<div>
			<label class="block mb-1">Pass Marks</label>
			<input type="number" class="border px-2 py-1 w-full" bind:value={form.passMarks} min="0" />
		</div>

		<div>
			<label class="block mb-1">Show Results to Students</label>
			<input type="checkbox" bind:checked={form.showResults} />
		</div>

		<div class="md:col-span-2">
			<label class="block mb-1">Instructions</label>
			<textarea class="border px-2 py-1 w-full" rows="4" bind:value={form.instructions}></textarea>
		</div>
	</div>

	<div class="mt-3">
		<button class="px-4 py-2 bg-blue-600 text-white rounded" on:click={submit} disabled={busy}>{busy ? 'Creating…' : 'Create Assessment'}</button>
	</div>
</div>

<style>
	/* simple local styles; project stylesheet may provide better visuals */
</style>
