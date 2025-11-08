<script>
	import { onMount } from 'svelte';
	import api from '$lib/utils/api';

	let assessments = [];
	let selected = '';
	let error = '';
	let loading = false;

	onMount(async () => {
		try {
			const resp = await api.assessments.getAll({ limit: 100 });
			assessments = resp.assessments || [];
			if (assessments.length) selected = assessments[0].id;
		} catch (err) {
			console.error('Failed to load assessments', err);
			error = err.message || 'Failed to load assessments';
		}
	});

	async function download(format) {
		if (!selected) {
			error = 'Please select an assessment';
			return;
		}

		loading = true;
		error = '';

		try {
			const filename = `${selected}-${format === 'pdf' ? 'results.pdf' : 'results.xlsx'}`;
			const url = `/upload/export/results/${selected}/${format}`;
			await api.upload.downloadFile(url, filename);
		} catch (err) {
			console.error('Download failed', err);
			error = err.message || 'Download failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-4 bg-white rounded shadow">
	<h3 class="text-lg font-semibold mb-3">Export Results</h3>

	{#if error}
		<div class="mb-3 text-red-600">{error}</div>
	{/if}

	<div class="mb-3">
		<label class="block mb-1">Assessment</label>
		<select bind:value={selected} class="border px-2 py-1 w-full">
			<option value="">-- Select assessment --</option>
			{#each assessments as a}
				<option value={a.id}>{a.title} — {a.class?.name || a.classId}</option>
			{/each}
		</select>
	</div>

	<div class="flex gap-2">
		<button class="px-3 py-1 bg-blue-600 text-white rounded" on:click={() => download('pdf')} disabled={!selected || loading}>Download PDF</button>
		<button class="px-3 py-1 bg-green-600 text-white rounded" on:click={() => download('excel')} disabled={!selected || loading}>{loading ? 'Preparing…' : 'Download Excel'}</button>
	</div>
</div>

<style></style>
