<script>
	// Receive data from +page.server.js via page store
	let { data } = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
	{#if data.error}
		<div class="col-span-4 text-red-600">{data.error}</div>
	{/if}

	<div class="p-4 bg-white rounded shadow">
		<div class="text-sm text-gray-500">Classes</div>
		<div class="text-2xl font-bold">{data.counts.classes}</div>
	</div>

	<div class="p-4 bg-white rounded shadow">
		<div class="text-sm text-gray-500">Subjects</div>
		<div class="text-2xl font-bold">{data.counts.subjects}</div>
	</div>

	<div class="p-4 bg-white rounded shadow">
		<div class="text-sm text-gray-500">Students</div>
		<div class="text-2xl font-bold">{data.counts.students}</div>
	</div>

	<div class="p-4 bg-white rounded shadow">
		<div class="text-sm text-gray-500">Assessments</div>
		<div class="text-2xl font-bold">{data.counts.assessments}</div>
	</div>
</div>

<div class="mt-6">
	<h3 class="text-lg font-semibold">Quick actions</h3>
	<div class="flex gap-3 mt-3">
		<a class="px-3 py-2 bg-blue-600 text-white rounded" href="/admin/assessments/create">Create Assessment</a>
		<a class="px-3 py-2 bg-green-600 text-white rounded" href="/admin/students">Upload Students</a>
	</div>
</div>
