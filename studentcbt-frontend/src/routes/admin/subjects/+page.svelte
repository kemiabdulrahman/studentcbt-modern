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
			const resp = await api.admin.subjects.create(form);
			subjects.push(resp.subject);
			form.name = '';
		} catch (err) {
			console.error('Create subject failed', err);
			error = err.message || 'Create failed';
		} finally { busy = false; }
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
	<div class="md:col-span-2">
		<h2 class="text-xl font-semibold mb-3">Subjects</h2>
		{#if error}
			<div class="text-red-600 mb-2">{error}</div>
		{/if}

		<div class="bg-white rounded shadow overflow-auto">
			<ul class="p-3 text-sm">
				{#each subjects as s}
					<li class="border-b py-2">{s.name}</li>
				{/each}
			</ul>
		</div>
	</div>

	<div>
		<h3 class="text-lg font-semibold mb-2">Create Subject</h3>
		<div class="bg-white p-4 rounded shadow">
			<label class="block mb-1">Name</label>
			<input class="border px-2 py-1 w-full mb-3" bind:value={form.name} />
			<button class="px-3 py-1 bg-blue-600 text-white rounded" on:click={create} disabled={busy}>{busy ? 'Creating…' : 'Create'}</button>
		</div>
	</div>
</div>
