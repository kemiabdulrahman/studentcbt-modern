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

<div class="space-y-6 p-4 lg:p-6">
	<!-- Error Message -->
	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
			{error}
		</div>
	{/if}

	<!-- Students List Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900">Students</h2>
			<p class="text-sm text-gray-600 mt-1">Manage all students in the system</p>
		</div>

		{#if loading}
			<div class="p-8 text-center text-gray-500">
				<svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<p>Loading students...</p>
			</div>
		{:else if students.length === 0}
			<div class="p-8 text-center text-gray-500">
				<p>No students found. Upload students to get started.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-4 py-3 text-left font-semibold text-gray-700">Student ID</th>
							<th class="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
							<th class="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
							<th class="px-4 py-3 text-left font-semibold text-gray-700">Class</th>
							<th class="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each students as s}
							<tr class="border-b border-gray-200 hover:bg-gray-50 transition">
								<td class="px-4 py-3 text-gray-600 text-sm">{s.studentId}</td>
								<td class="px-4 py-3 text-gray-900 font-medium">{s.firstName} {s.lastName}</td>
								<td class="px-4 py-3 text-gray-600 text-sm">{s.user?.email}</td>
								<td class="px-4 py-3 text-gray-600 text-sm">{s.class?.name || '-'}</td>
								<td class="px-4 py-3">
									<button
										on:click={() => remove(s.id)}
										class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
									>
										Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination Info -->
			{#if pagination.total}
				<div class="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
					Showing {students.length} of {pagination.total} students
					{#if pagination.pages > 1}
						• Page {pageNum} of {pagination.pages}
					{/if}
				</div>
			{/if}
		{/if}
	</div>

	<!-- Upload Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h3 class="text-xl font-bold text-gray-900">Upload / Create Students</h3>
			<p class="text-sm text-gray-600 mt-1">Import students from Excel file or create manually</p>
		</div>

		<div class="p-4 lg:p-6">
			<StudentUpload />
		</div>
	</div>
</div>
