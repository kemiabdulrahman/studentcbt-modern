<script>
	import { onMount } from 'svelte';
	import StudentUpload from '$lib/components/admin/StudentUpload.svelte';
	import api from '$lib/utils/api';

	let students = [];
	let pagination = {};
	let pageNum = 1;
	let limit = 10;
	let error = '';
	let loading = false;

	async function load() {
		loading = true;
		try {
			const resp = await api.admin.students.getAll({ page: pageNum, limit });
			students = resp.students || [];
			pagination = resp.pagination || {};
		} catch (err) {
			console.error('Load students failed', err);
			error = err.message || 'Failed to load students';
		} finally {
			loading = false;
		}
	}

	onMount(load);

	async function remove(id) {
		if (!confirm('Delete student?')) return;
		try {
			await api.admin.students.delete(id);
			students = students.filter(s => s.id !== id);
		} catch (err) {
			console.error('Delete failed', err);
			error = err.message || 'Delete failed';
		}
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
	<div class="md:col-span-2">
		<h2 class="text-xl font-semibold mb-3">Students</h2>
		{#if error}
			<div class="text-red-600 mb-2">{error}</div>
		{/if}

		{#if loading}
			<div>Loading…</div>
		{:else}
			<div class="bg-white rounded shadow overflow-auto">
				<table class="min-w-full text-sm">
					<thead class="bg-gray-100 text-left">
						<tr>
							<th class="p-2">Student ID</th>
							<th class="p-2">Name</th>
							<th class="p-2">Email</th>
							<th class="p-2">Class</th>
							<th class="p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each students as s}
							<tr class="border-t">
								<td class="p-2">{s.studentId}</td>
								<td class="p-2">{s.firstName} {s.lastName}</td>
								<td class="p-2">{s.user?.email}</td>
								<td class="p-2">{s.class?.name}</td>
								<td class="p-2"><button class="text-red-600" on:click={() => remove(s.id)}>Delete</button></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<div>
		<h3 class="text-lg font-semibold mb-2">Upload / Create</h3>
		<div class="bg-white p-4 rounded shadow">
			<StudentUpload />
		</div>
	</div>
</div>
