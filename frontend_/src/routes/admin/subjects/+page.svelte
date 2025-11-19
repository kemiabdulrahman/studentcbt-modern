<script>
	import api from '$lib/utils/api';
	
	let { data } = $props();

	let form = $state({ name: '' });
	let error = $state(data?.error || '');
	let success = $state('');
	let busy = $state(false);

	let subjects = $state(data?.subjects || []);

	async function create() {
		if (!form.name) return;
		busy = true;
		error = '';
		success = '';
		try {
			const resp = await api.admin.subjects.create(form);
			// Reactively add the new subject to the list
			subjects = [...subjects, resp.subject];
			form.name = '';
			success = 'Subject created successfully!';
			// Auto-clear success message after 3 seconds
			setTimeout(() => success = '', 3000);
		} catch (err) {
			console.error('Create subject failed', err);
			error = err.message || 'Create failed';
		} finally {
			busy = false;
		}
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
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center animate-pulse">
			<span>{success}</span>
			<button on:click={() => success = ''} class="text-green-600 hover:text-green-800">✕</button>
		</div>
	{/if}

	<!-- Subjects List Section -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-4 lg:p-6 border-b border-gray-200">
			<div class="flex justify-between items-start">
				<div>
					<h2 class="text-2xl font-bold text-gray-900">Subjects</h2>
					<p class="text-sm text-gray-600 mt-1">Manage all subjects in the system ({subjects.length} total)</p>
				</div>
			</div>
		</div>

		{#if subjects.length === 0}
			<div class="p-8 text-center">
				<div class="text-6xl mb-4">📚</div>
				<p class="text-gray-600 font-medium mb-2">No subjects yet</p>
				<p class="text-gray-500 text-sm">Create your first subject to get started</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-4 py-3 text-left font-semibold text-gray-700">#</th>
							<th class="px-4 py-3 text-left font-semibold text-gray-700">Subject Name</th>
							<th class="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
						</tr>
					</thead>
					<tbody>
						{#each subjects as s, i (s.id)}
							<tr class="border-b border-gray-200 hover:bg-gray-50 transition animate-in fade-in">
								<td class="px-4 py-3 text-gray-600 font-medium">{i + 1}</td>
								<td class="px-4 py-3 text-gray-900 font-medium">{s.name}</td>
								<td class="px-4 py-3 text-gray-600 text-xs">
									{#if s.createdAt}
										{new Date(s.createdAt).toLocaleDateString()}
									{:else}
										Just now
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
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

<style>
	:global(.animate-in) {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
