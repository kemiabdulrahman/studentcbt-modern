<script>
	import api from '$lib/utils/api';

	let { data } = $props();

	let classes = $state(data?.classes || []);
	let subjects = $state(data?.subjects || []);
	let form = $state({ name: '', stream: '' });
	let error = $state(data?.error || '');
	let success = $state('');
	let busy = $state(false);

	// assignment state
	let selectedClassForAssign = $state('');
	let selectedSubjectId = $state(''); // Single subject for assignment
	let selectedSubjectIds = $state([]); // Multi-select array
	let assignedSubjects = $state([]);
	let showAssignedModal = $state(false);

	async function createClass() {
		if (!form.name) return;
		busy = true;
		error = '';
		success = '';
		try {
			const resp = await api.admin.classes.create(form);
			classes = [...classes, resp.class];
			form.name = '';
			form.stream = '';
			success = 'Class created successfully!';
			setTimeout(() => success = '', 3000);
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
			showAssignedModal = true;
		} catch (err) {
			console.error('Get class subjects failed', err);
			error = err.message || 'Failed to load subjects';
		}
	}

	function toggleSubjectSelection(subjectId) {
		if (selectedSubjectIds.includes(subjectId)) {
			selectedSubjectIds = selectedSubjectIds.filter(id => id !== subjectId);
		} else {
			selectedSubjectIds = [...selectedSubjectIds, subjectId];
		}
	}

	async function assignSubjects() {
		if (!selectedClassForAssign || selectedSubjectIds.length === 0) {
			error = 'Please select a class and at least one subject to assign';
			return;
		}

		busy = true;
		error = '';
		success = '';
		
		try {
			// Assign all selected subjects
			for (const subjectId of selectedSubjectIds) {
				await api.admin.subjects.assignToClass({ 
					classId: selectedClassForAssign, 
					subjectId 
				});
			}
			
			// Refresh assigned subjects immediately
			await viewSubjects(selectedClassForAssign);
			selectedSubjectIds = [];
			success = `${selectedSubjectIds.length} subject(s) assigned successfully!`;
			setTimeout(() => success = '', 3000);
		} catch (err) {
			console.error('Assign subjects failed', err);
			error = err.message || 'Assignment failed';
		} finally {
			busy = false;
		}
	}

	function clearSelection() {
		selectedClassForAssign = '';
		selectedSubjectIds = [];
		assignedSubjects = [];
		showAssignedModal = false;
	}

	// Get already assigned subject IDs
	function getAssignedSubjectIds() {
		return assignedSubjects.map(asg => asg.subjectId);
	}
</script>

<div class="space-y-6 p-4 lg:p-6">
	<!-- Error Message -->
	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
			<span>{error}</span>
			<button on:click={() => error = ''} class="text-red-600 hover:text-red-800">✕</button>
		</div>
	{/if}

	<!-- Success Message -->
	{#if success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
			<span>{success}</span>
			<button on:click={() => success = ''} class="text-green-600 hover:text-green-800">✕</button>
		</div>
	{/if}

	<!-- Classes List Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900">Classes</h2>
			<p class="text-sm text-gray-600 mt-1">Manage all classes in the system</p>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Stream</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each classes as c}
						<tr class="border-b border-gray-200 hover:bg-gray-50 transition">
							<td class="px-4 py-3 text-gray-900 font-medium">{c.name}</td>
							<td class="px-4 py-3 text-gray-600">{c.stream || '-'}</td>
							<td class="px-4 py-3">
								<button
									on:click={() => viewSubjects(c.id)}
									class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
								>
									View Subjects
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if classes.length === 0}
			<div class="p-6 text-center text-gray-500">
				<p>No classes found. Create one to get started.</p>
			</div>
		{/if}
	</div>

	<!-- Create Class Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h3 class="text-xl font-bold text-gray-900">Create New Class</h3>
			<p class="text-sm text-gray-600 mt-1">Add a new class to the system</p>
		</div>

		<div class="p-4 lg:p-6">
			<form on:submit|preventDefault={createClass} class="space-y-4">
				<div>
					<label for="class-name" class="block text-sm font-medium text-gray-700 mb-1">
						Class Name <span class="text-red-600">*</span>
					</label>
					<input
						id="class-name"
						type="text"
						bind:value={form.name}
						placeholder="e.g., JSS1, SSS3"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					/>
				</div>

				<div>
					<label for="class-stream" class="block text-sm font-medium text-gray-700 mb-1">
						Stream (Optional)
					</label>
					<input
						id="class-stream"
						type="text"
						bind:value={form.stream}
						placeholder="e.g., Science, Arts, Commercial"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<button
					type="submit"
					disabled={busy || !form.name}
					class="w-full lg:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{busy ? 'Creating...' : 'Create Class'}
				</button>
			</form>
		</div>
	</div>

	<!-- Assign Subjects Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h3 class="text-xl font-bold text-gray-900">Assign Subjects to Class</h3>
			<p class="text-sm text-gray-600 mt-1">Link multiple subjects to a class at once</p>
		</div>

		<div class="p-4 lg:p-6">
			<form on:submit|preventDefault={assignSubjects} class="space-y-4">
				<div>
					<label for="select-class" class="block text-sm font-medium text-gray-700 mb-1">
						Select Class <span class="text-red-600">*</span>
					</label>
					<select
						id="select-class"
						bind:value={selectedClassForAssign}
						on:change={() => {
							if (selectedClassForAssign) {
								viewSubjects(selectedClassForAssign);
							}
						}}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					>
						<option value="">-- Select a class --</option>
						{#each classes as c}
							<option value={c.id}>{c.name}{c.stream ? ` — ${c.stream}` : ''}</option>
						{/each}
					</select>
				</div>

				{#if selectedClassForAssign}
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-3">
							Select Subjects <span class="text-red-600">*</span>
							<span class="text-xs text-gray-600 font-normal">({selectedSubjectIds.length} selected)</span>
						</label>

						<div class="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
							{#each subjects as s}
								{@const isAssigned = getAssignedSubjectIds().includes(s.id)}
								<label class="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer transition">
									<input
										type="checkbox"
										checked={selectedSubjectIds.includes(s.id)}
										on:change={() => toggleSubjectSelection(s.id)}
										disabled={isAssigned}
										class="w-4 h-4 rounded text-blue-600 cursor-pointer"
									/>
									<span class={isAssigned ? 'text-gray-500 line-through' : 'text-gray-900'}>
										{s.name}
									</span>
									{#if isAssigned}
										<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Already assigned</span>
									{/if}
								</label>
							{/each}

							{#if subjects.length === 0}
								<p class="text-gray-500 text-sm py-4">No subjects available. Create subjects first.</p>
							{/if}
						</div>
					</div>

					<div class="flex flex-col sm:flex-row gap-2">
						<button
							type="submit"
							disabled={busy || selectedSubjectIds.length === 0}
							class="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{busy ? 'Assigning...' : `Assign ${selectedSubjectIds.length} Subject${selectedSubjectIds.length !== 1 ? 's' : ''}`}
						</button>
						<button
							type="button"
							on:click={clearSelection}
							class="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
						>
							Clear Selection
						</button>
					</div>
				{/if}

				<!-- Assigned Subjects List - Shown Immediately After Assignment -->
				{#if assignedSubjects && assignedSubjects.length > 0 && selectedClassForAssign}
					<div class="mt-6 pt-6 border-t border-gray-200">
						<h4 class="font-semibold text-gray-900 mb-3">
							Subjects for {selectedClassForAssign ? classes.find(c => c.id === selectedClassForAssign)?.name : ''} ({assignedSubjects.length})
						</h4>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							{#each assignedSubjects as asg (asg.id)}
								<div class="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-3 rounded-lg hover:shadow transition">
									<div class="w-3 h-3 bg-green-600 rounded-full flex-shrink-0"></div>
									<span class="text-sm font-medium text-gray-900">{asg.subject?.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{:else if selectedClassForAssign && assignedSubjects.length === 0}
					<div class="mt-6 pt-6 border-t border-gray-200">
						<p class="text-gray-500 text-sm">No subjects assigned to this class yet.</p>
					</div>
				{/if}
			</form>
		</div>
	</div>
</div>

<div class="space-y-6 p-4 lg:p-6">
	<!-- Error Message -->
	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
			{error}
		</div>
	{/if}

	<!-- Classes List Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900">Classes</h2>
			<p class="text-sm text-gray-600 mt-1">Manage all classes in the system</p>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Stream</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each classes as c}
						<tr class="border-b border-gray-200 hover:bg-gray-50 transition">
							<td class="px-4 py-3 text-gray-900">{c.name}</td>
							<td class="px-4 py-3 text-gray-600">{c.stream || '-'}</td>
							<td class="px-4 py-3">
								<button
									on:click={() => viewSubjects(c.id)}
									class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
								>
									View Subjects
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Create Class Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h3 class="text-xl font-bold text-gray-900">Create New Class</h3>
			<p class="text-sm text-gray-600 mt-1">Add a new class to the system</p>
		</div>

		<div class="p-4 lg:p-6">
			<form on:submit|preventDefault={createClass} class="space-y-4">
				<div>
					<label for="class-name" class="block text-sm font-medium text-gray-700 mb-1">
						Class Name <span class="text-red-600">*</span>
					</label>
					<input
						id="class-name"
						type="text"
						bind:value={form.name}
						placeholder="e.g., JSS1, SSS3"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					/>
				</div>

				<div>
					<label for="class-stream" class="block text-sm font-medium text-gray-700 mb-1">
						Stream (Optional)
					</label>
					<input
						id="class-stream"
						type="text"
						bind:value={form.stream}
						placeholder="e.g., Science, Arts, Commercial"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<button
					type="submit"
					disabled={busy || !form.name}
					class="w-full lg:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{busy ? 'Creating...' : 'Create Class'}
				</button>
			</form>
		</div>
	</div>

	<!-- Assign Subject Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<h3 class="text-xl font-bold text-gray-900">Assign Subjects to Class</h3>
			<p class="text-sm text-gray-600 mt-1">Link subjects with classes</p>
		</div>

		<div class="p-4 lg:p-6">
			<form on:submit|preventDefault={assignSubject} class="space-y-4">
				<div>
					<label for="select-class" class="block text-sm font-medium text-gray-700 mb-1">
						Select Class <span class="text-red-600">*</span>
					</label>
					<select
						id="select-class"
						bind:value={selectedClassForAssign}
						on:change={() => viewSubjects(selectedClassForAssign)}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					>
						<option value="">-- Select a class --</option>
						{#each classes as c}
							<option value={c.id}>{c.name}{c.stream ? ` — ${c.stream}` : ''}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="select-subject" class="block text-sm font-medium text-gray-700 mb-1">
						Select Subject <span class="text-red-600">*</span>
					</label>
					<select
						id="select-subject"
						bind:value={selectedSubjectId}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
						required
					>
						<option value="">-- Select a subject --</option>
						{#each subjects as s}
							<option value={s.id}>{s.name}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col sm:flex-row gap-2">
					<button
						type="submit"
						disabled={busy || !selectedClassForAssign || !selectedSubjectId}
						class="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{busy ? 'Assigning...' : 'Assign Subject'}
					</button>
					<button
						type="button"
						on:click={() => {
							selectedClassForAssign = '';
							selectedSubjectId = '';
							assignedSubjects = [];
						}}
						class="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
					>
						Clear
					</button>
				</div>

				<!-- Assigned Subjects List -->
				{#if assignedSubjects && assignedSubjects.length > 0}
					<div class="mt-6 pt-6 border-t border-gray-200">
						<h4 class="font-semibold text-gray-900 mb-3">Assigned Subjects for {selectedClassForAssign ? classes.find(c => c.id === selectedClassForAssign)?.name : ''}</h4>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
							{#each assignedSubjects as asg}
								<div class="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
									<div class="w-2 h-2 bg-blue-600 rounded-full"></div>
									<span class="text-sm text-gray-900">{asg.subject?.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</form>
		</div>
	</div>
</div>
