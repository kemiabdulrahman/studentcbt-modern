<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';

	let counts = {
		classes: 0,
		subjects: 0,
		students: 0,
		assessments: 0
	};

	let error = '';

	onMount(async () => {
		try {
			const c = await api.admin.classes.getAll();
			counts.classes = (c.classes || []).length;
			const s = await api.admin.subjects.getAll();
			counts.subjects = (s.subjects || []).length;
			const st = await api.admin.students.getAll({ limit: 1 });
			counts.students = st.pagination?.total || (st.students || []).length || 0;
			const a = await api.assessments.getAll({ limit: 1 });
			counts.assessments = a.pagination?.total || (a.assessments || []).length || 0;
		} catch (err) {
			console.error('Dashboard load error', err);
			error = err.message || 'Failed to load dashboard';
		}
	});
</script>

<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
	{#if error}
		<div class="col-span-4 text-red-600">{error}</div>
	{/if}

	<div class="p-4 bg-white rounded shadow">
		<div class="text-sm text-gray-500">Classes</div>
		<div class="text-2xl font-bold">{counts.classes}</div>
	</div>

	<div class="p-4 bg-white rounded shadow">
		<div class="text-sm text-gray-500">Subjects</div>
		<div class="text-2xl font-bold">{counts.subjects}</div>
	</div>

	<div class="p-4 bg-white rounded shadow">
		<div class="text-sm text-gray-500">Students</div>
		<div class="text-2xl font-bold">{counts.students}</div>
	</div>

	<div class="p-4 bg-white rounded shadow">
		<div class="text-sm text-gray-500">Assessments</div>
		<div class="text-2xl font-bold">{counts.assessments}</div>
	</div>
</div>

<div class="mt-6">
	<h3 class="text-lg font-semibold">Quick actions</h3>
	<div class="flex gap-3 mt-3">
		<a class="px-3 py-2 bg-blue-600 text-white rounded" href="/admin/assessments/create">Create Assessment</a>
		<a class="px-3 py-2 bg-green-600 text-white rounded" href="/admin/students">Upload Students</a>
	</div>
</div>
