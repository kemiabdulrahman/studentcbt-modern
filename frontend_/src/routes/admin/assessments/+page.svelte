<script>
	import { goto } from '$app/navigation';

	let { data } = $props();
	let deleteError = $state('');

	async function remove(id) {
		if (!confirm('Delete assessment?')) return;
		try {
			await fetch(`/api/assessments/${id}`, { method: 'DELETE' });
			data.assessments = data.assessments.filter(a => a.id !== id);
			deleteError = '';
		} catch (err) {
			console.error('Delete failed', err);
			deleteError = err.message || 'Delete failed';
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

{#if data.error}
	<div class="text-red-600 mb-3">{data.error}</div>
{/if}

{#if deleteError}
	<div class="text-red-600 mb-3">{deleteError}</div>
{/if}

{#if data.assessments.length === 0}
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
			{#each data.assessments as a}
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
