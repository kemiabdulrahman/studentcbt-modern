<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import api from '$lib/utils/api';

	let assessments = [];
	let error = '';
	let loading = false;

	async function load() {
		loading = true;
		try {
			const resp = await api.assessments.getAll({ limit: 50 });
			assessments = resp.assessments || [];
		} catch (err) {
			console.error('Load assessments failed', err);
			error = err.message || 'Failed to load assessments';
		} finally {
			loading = false;
		}
	}

	onMount(load);

	async function remove(id) {
		if (!confirm('Delete assessment?')) return;
		try {
			await api.assessments.delete(id);
			assessments = assessments.filter(a => a.id !== id);
		} catch (err) {
			console.error('Delete failed', err);
			error = err.message || 'Delete failed';
		}
	}

	function openCreate() {
		goto('/admin/assessments/create');
	}
</script>

<div class="flex justify-between items-center mb-4">
	<h2 class="text-xl font-semibold">Assessments</h2>
	<div>
		<button class="px-3 py-1 bg-blue-600 text-white rounded" on:click={openCreate}>Create</button>
	</div>
</div>

{#if error}
	<div class="text-red-600 mb-3">{error}</div>
{/if}

{#if loading}
	<div>Loading…</div>
{:else}
	{#if assessments.length === 0}
		<div class="bg-white p-4 rounded shadow">No assessments found</div>
	{:else}
		<div class="bg-white rounded shadow overflow-auto">
			<table class="min-w-full text-sm">
				<thead class="bg-gray-100 text-left">
					<tr>
						<th class="p-2">Title</th>
						<th class="p-2">Class</th>
						<th class="p-2">Subject</th>
						<th class="p-2">Status</th>
						<th class="p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each assessments as a}
						<tr class="border-t">
							<td class="p-2">{a.title}</td>
							<td class="p-2">{a.class?.name || a.classId}</td>
							<td class="p-2">{a.subject?.name || a.subjectId}</td>
							<td class="p-2">{a.status}</td>
							<td class="p-2">
								<a class="text-blue-600 mr-3" href={`/admin/assessments/${a.id}`}>View</a>
								<button class="text-red-600" on:click={() => remove(a.id)}>Delete</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
{/if}
