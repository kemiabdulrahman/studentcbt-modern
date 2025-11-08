<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';

	let classes = [];
	let subjects = [];
	let form = { name: '', stream: '' };
	let error = '';
	let busy = false;

	// assignment state
	let selectedClassForAssign = '';
	let selectedSubjectId = '';
	let assignedSubjects = [];

	async function load() {
		try {
			const c = await api.admin.classes.getAll();
			classes = c.classes || [];
			const s = await api.admin.subjects.getAll();
			subjects = s.subjects || [];
		} catch (err) {
			console.error('Load classes error', err);
			error = err.message || 'Failed to load';
		}
	}

	onMount(load);

	async function createClass() {
		if (!form.name) return;
		busy = true;
		error = '';
		try {
			const resp = await api.admin.classes.create(form);
			classes.push(resp.class);
			form.name = '';
			form.stream = '';
		} catch (err) {
			console.error('Create class failed', err);
			error = err.message || 'Create failed';
		} finally {
			busy = false;
		}
	}

	async function viewSubjects(classId) {
		try {
			const resp = await api.admin.classes.getSubjects(classId);
			assignedSubjects = resp.classSubjects || [];
			selectedClassForAssign = classId;
		} catch (err) {
			console.error('Get class subjects failed', err);
			error = err.message || 'Failed to load subjects';
		}
	}

	async function assignSubject() {
		if (!selectedClassForAssign || !selectedSubjectId) {
			error = 'Please select a class and a subject to assign';
			return;
		}

		busy = true;
		error = '';
		try {
			const resp = await api.admin.subjects.assignToClass({ classId: selectedClassForAssign, subjectId: selectedSubjectId });
			// refresh assigned subjects
			await viewSubjects(selectedClassForAssign);
			// keep selected subject selected for quick multiple assigns
			return resp;
		} catch (err) {
			console.error('Assign subject failed', err);
			error = err.message || 'Assign failed';
		} finally {
			busy = false;
		}
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
	<div class="md:col-span-2">
		<h2 class="text-xl font-semibold mb-3">Classes</h2>
		{#if error}
			<div class="text-red-600 mb-2">{error}</div>
		{/if}

		<div class="bg-white rounded shadow overflow-auto">
			<table class="min-w-full text-sm">
				<thead class="bg-gray-100 text-left">
					<tr>
						<th class="p-2">Name</th>
						<th class="p-2">Stream</th>
						<th class="p-2">Subjects</th>
					</tr>
				</thead>
				<tbody>
					{#each classes as c}
						<tr class="border-t">
							<td class="p-2">{c.name}</td>
							<td class="p-2">{c.stream}</td>
							<td class="p-2"><button class="text-blue-600" on:click={() => viewSubjects(c.id)}>View</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div>
		<h3 class="text-lg font-semibold mb-2">Create Class</h3>
		<div class="bg-white p-4 rounded shadow">
			<label class="block mb-1">Name</label>
			<input class="border px-2 py-1 w-full mb-2" bind:value={form.name} />
			<label class="block mb-1">Stream</label>
			<input class="border px-2 py-1 w-full mb-3" bind:value={form.stream} />
			<button class="px-3 py-1 bg-blue-600 text-white rounded" on:click={createClass} disabled={busy}>{busy ? 'Creating…' : 'Create'}</button>
		</div>
	</div>

	<div class="mt-4">
		<h3 class="text-lg font-semibold mb-2">Assign Subject to Class</h3>
		<div class="bg-white p-4 rounded shadow">
			<label class="block mb-1">Select Class</label>
			<select class="border px-2 py-1 w-full mb-2" bind:value={selectedClassForAssign} on:change={() => viewSubjects(selectedClassForAssign)}>
				<option value="">-- Select class --</option>
				{#each classes as c}
					<option value={c.id}>{c.name}{c.stream ? ` — ${c.stream}` : ''}</option>
				{/each}
			</select>

			<label class="block mb-1">Select Subject</label>
			<select class="border px-2 py-1 w-full mb-3" bind:value={selectedSubjectId}>
				<option value="">-- Select subject --</option>
				{#each subjects as s}
					<option value={s.id}>{s.name}</option>
				{/each}
			</select>

			<div class="flex gap-2">
				<button class="px-3 py-1 bg-green-600 text-white rounded" on:click={assignSubject} disabled={busy || !selectedClassForAssign || !selectedSubjectId}>{busy ? 'Assigning…' : 'Assign'}</button>
				<button class="px-3 py-1 bg-gray-200 rounded" on:click={() => { selectedClassForAssign=''; selectedSubjectId=''; assignedSubjects=[]; }}>Clear</button>
			</div>

			{#if assignedSubjects && assignedSubjects.length > 0}
				<div class="mt-3">
					<h4 class="font-medium">Assigned Subjects</h4>
					<ul class="text-sm list-disc ml-5 mt-2">
						{#each assignedSubjects as asg}
							<li>{asg.subject?.name}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>
</div>
