<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';

	let subjects = [];
	let form = { name: '' };
	let error = '';
	let busy = false;

	async function load() {
		try {
			const resp = await api.admin.subjects.getAll();
			subjects = resp.subjects || [];
		} catch (err) {
			console.error('Load subjects failed', err);
			error = err.message || 'Failed to load subjects';
		}
	}

	onMount(load);

	async function create() {
		if (!form.name) return;
		busy = true; error = '';
		try {
			await api.admin.subjects.create(form);
			form.name = '';
			await load();
		} catch (err) {
			console.error('Create subject failed', err);
			error = err.message || 'Create failed';
		} finally { busy = false; }
	}
</script>

<div class="space-y-6 p-4 lg:p-6">
	<!-- Error Message -->
	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
			{error}
		</div>
	{/if}

	<!-- Subjects List Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900">Subjects</h2>
			<p class="text-sm text-gray-600 mt-1">Manage all subjects in the system</p>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">#</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Subject Name</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each subjects as s, i}
						<tr class="border-b border-gray-200 hover:bg-gray-50 transition">
							<td class="px-4 py-3 text-gray-600">{i + 1}</td>
							<td class="px-4 py-3 text-gray-900 font-medium">{s.name}</td>
							<td class="px-4 py-3">
								<button type="button" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if subjects.length === 0}
			<div class="p-6 text-center text-gray-500">
				<p>No subjects found. Create one to get started.</p>
			</div>
		{/if}
	</div>

	<!-- Create Subject Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h3 class="text-xl font-bold text-gray-900">Create New Subject</h3>
			<p class="text-sm text-gray-600 mt-1">Add a new subject to the system</p>
		</div>

		<div class="p-4 lg:p-6">
			<form on:submit|preventDefault={create} class="space-y-4">
				<div>
					<label for="subject-name" class="block text-sm font-medium text-gray-700 mb-1">
						Subject Name <span class="text-red-600">*</span>
					</label>
					<input
						id="subject-name"
						type="text"
						bind:value={form.name}
						placeholder="e.g., Mathematics, English, Biology"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					/>
				</div>

				<button
					type="submit"
					disabled={busy || !form.name}
					class="w-full lg:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{busy ? 'Creating...' : 'Create Subject'}
				</button>
			</form>
		</div>
	</div>
</div>
