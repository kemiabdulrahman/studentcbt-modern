<script>
	import { page } from '$app/stores';
	import api from '$lib/utils/api';
	import { toastStore } from '$lib/stores/ui';
	import QuestionsManager from '$lib/components/admin/QuestionsManager.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	let { data } = $props();

	let assessment = $state(data?.assessment || null);
	let error = $state(data?.error || '');
	let currentTab = $state('overview');
	let publishing = $state(false);
	let showResultsToggle = $state(false);
	let toggleValue = $state(assessment?.showResults || false);

	let assessmentId = $derived($page.params.id);

	async function publishAssessment() {
		if (!assessment.questions || assessment.questions.length === 0) {
			toastStore.error('Assessment must have at least one question');
			return;
		}

		publishing = true;
		try {
			await api.assessments.publish(assessmentId);
			toastStore.success('Assessment published successfully');
			// Refresh assessment data from server
			const resp = await api.assessments.getById(assessmentId);
			assessment = resp.assessment || resp;
		} catch (err) {
			console.error('Publish failed', err);
			toastStore.error(err.message || 'Failed to publish assessment');
		} finally {
			publishing = false;
		}
	}

	async function toggleResultVisibility() {
		try {
			await api.assessments.toggleResults(assessmentId, toggleValue);
			toastStore.success(`Results ${toggleValue ? 'enabled' : 'disabled'} for students`);
			showResultsToggle = false;
			// Refresh assessment data from server
			const resp = await api.assessments.getById(assessmentId);
			assessment = resp.assessment || resp;
		} catch (err) {
			console.error('Toggle results failed', err);
			toastStore.error(err.message || 'Failed to toggle results');
			toggleValue = assessment.showResults;
		}
	}

	async function exportPDF() {
		try {
			await api.upload.downloadFile(`/upload/export/results/${assessmentId}/pdf`, `${assessment.title}-results.pdf`);
		} catch (err) {
			console.error('Export failed', err);
			toastStore.error(err.message || 'Export failed');
		}
	}

	async function exportExcel() {
		try {
			await api.upload.downloadFile(`/upload/export/results/${assessmentId}/excel`, `${assessment.title}-results.xlsx`);
		} catch (err) {
			console.error('Export failed', err);
			toastStore.error(err.message || 'Export failed');
		}
	}

	function isActive(tab) {
		return currentTab === tab;
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	{#if assessment}
		<div class="flex justify-between items-start gap-4">
			<div>
				<h1 class="text-3xl font-bold">{assessment.title}</h1>
				<p class="text-gray-600 mt-2">{assessment.subject?.name} • {assessment.class?.name}</p>
				<p class="text-gray-700 mt-1">{assessment.description}</p>
			</div>
			<div class="flex items-center gap-2">
				{#if assessment.status === 'DRAFT'}
					<Badge class="bg-yellow-100 text-yellow-800">{assessment.status}</Badge>
				{:else if assessment.status === 'PUBLISHED'}
					<Badge class="bg-green-100 text-green-800">{assessment.status}</Badge>
				{:else}
					<Badge class="bg-gray-100 text-gray-800">{assessment.status}</Badge>
				{/if}
			</div>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-blue-600">{assessment.questions?.length || 0}</div>
					<div class="text-sm text-gray-600">Questions</div>
				</div>
			</Card>
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600">{assessment.totalMarks || 0}</div>
					<div class="text-sm text-gray-600">Total Marks</div>
				</div>
			</Card>
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-purple-600">{assessment.passMarks}%</div>
					<div class="text-sm text-gray-600">Pass Mark</div>
				</div>
			</Card>
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-orange-600">{assessment.duration}</div>
					<div class="text-sm text-gray-600">Minutes</div>
				</div>
			</Card>
			<Card>
				<div class="text-center">
					<div class="text-2xl font-bold text-indigo-600">{assessment._count?.attempts || 0}</div>
					<div class="text-sm text-gray-600">Attempts</div>
				</div>
			</Card>
		</div>

		<!-- Tab Navigation -->
		<div class="border-b border-gray-200 flex gap-0">
			<button
				on:click={() => currentTab = 'overview'}
				class={`px-4 py-2 font-medium border-b-2 transition ${isActive('overview') ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
			>
				Overview
			</button>
			<button
				on:click={() => currentTab = 'questions'}
				class={`px-4 py-2 font-medium border-b-2 transition ${isActive('questions') ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
			>
				Questions
			</button>
			<button
				on:click={() => currentTab = 'results'}
				class={`px-4 py-2 font-medium border-b-2 transition ${isActive('results') ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
			>
				Results
			</button>
		</div>

		<!-- Tab Content -->
		<div class="min-h-96">
			<!-- Overview Tab -->
			{#if isActive('overview')}
				<div class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Assessment Details -->
						<Card>
							<h3 class="font-bold mb-3">Assessment Details</h3>
							<div class="space-y-2 text-sm">
								<div>
									<span class="text-gray-600">Duration:</span>
									<span class="font-semibold">{assessment.duration} minutes</span>
								</div>
								<div>
									<span class="text-gray-600">Total Marks:</span>
									<span class="font-semibold">{assessment.totalMarks || 0}</span>
								</div>
								<div>
									<span class="text-gray-600">Pass Marks:</span>
									<span class="font-semibold">{assessment.passMarks}%</span>
								</div>
								{#if assessment.startTime}
									<div>
										<span class="text-gray-600">Start Time:</span>
										<span class="font-semibold">{new Date(assessment.startTime).toLocaleString()}</span>
									</div>
								{/if}
								{#if assessment.endTime}
									<div>
										<span class="text-gray-600">End Time:</span>
										<span class="font-semibold">{new Date(assessment.endTime).toLocaleString()}</span>
									</div>
								{/if}
							</div>
						</Card>

						<!-- Instructions -->
						<Card>
							<h3 class="font-bold mb-3">Instructions</h3>
							<p class="text-sm whitespace-pre-wrap">{assessment.instructions || 'No instructions provided'}</p>
						</Card>
					</div>

					<!-- Actions -->
					<Card>
						<h3 class="font-bold mb-3">Assessment Actions</h3>
						<div class="space-y-3">
							{#if assessment.status === 'DRAFT'}
								<div>
									<Button
										on:click={publishAssessment}
										disabled={publishing || (assessment.questions?.length || 0) === 0}
										class="w-full"
									>
										{publishing ? 'Publishing...' : '📢 Publish Assessment'}
									</Button>
									{#if (assessment.questions?.length || 0) === 0}
										<p class="text-xs text-red-600 mt-1">⚠️ Add at least one question before publishing</p>
									{/if}
								</div>
							{:else if assessment.status === 'PUBLISHED'}
								<div class="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-900">
									✓ This assessment is published and available to students
								</div>
							{/if}

							<div>
								<Button variant="secondary" on:click={() => showResultsToggle = true} class="w-full">
									👁️ {assessment.showResults ? 'Hide Results' : 'Show Results'} to Students
								</Button>
								<p class="text-xs text-gray-600 mt-1">
									Currently: <span class="font-semibold">{assessment.showResults ? 'Students can view results' : 'Results hidden from students'}</span>
								</p>
							</div>

							<div class="pt-2 border-t">
								<p class="text-sm font-medium mb-2">Export Results</p>
								<div class="flex gap-2">
									<Button variant="secondary" on:click={exportPDF} size="sm" class="flex-1">
										📄 PDF
									</Button>
									<Button variant="secondary" on:click={exportExcel} size="sm" class="flex-1">
										📊 Excel
									</Button>
								</div>
							</div>
						</div>
					</Card>
				</div>
			{/if}

			<!-- Questions Tab -->
			{#if isActive('questions')}
				<div class="bg-white rounded-lg shadow p-6">
					<QuestionsManager {assessmentId} />
				</div>
			{/if}

			<!-- Results Tab -->
			{#if isActive('results')}
				<div class="space-y-4">
					<div class="text-center py-6 text-gray-500">
						<p class="text-lg mb-4">📊 View All Attempts</p>
						<a href="/admin/assessments/{assessmentId}/results" class="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition">
							View Results Dashboard →
						</a>
					</div>
					<Card>
						<h3 class="font-bold mb-3">Export Options</h3>
						<div class="flex gap-2">
							<Button variant="secondary" on:click={exportPDF} size="sm" class="flex-1">
								📄 PDF Report
							</Button>
							<Button variant="secondary" on:click={exportExcel} size="sm" class="flex-1">
								📊 Excel Sheet
							</Button>
						</div>
					</Card>
				</div>
			{/if}
		</div>
	{:else if error}
		<Card>
			<div class="text-red-600">{error}</div>
		</Card>
	{:else}
		<div class="text-center py-12">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<p class="mt-4">Loading assessment...</p>
		</div>
	{/if}
</div>

<!-- Results Toggle Modal -->
{#if showResultsToggle && assessment}
	<Modal on:close={() => showResultsToggle = false}>
		<h3 class="text-xl font-bold mb-4">
			{toggleValue ? 'Show Results' : 'Hide Results'} to Students?
		</h3>
		<p class="text-gray-700 mb-4">
			{#if toggleValue}
				Students will be able to view their results and answers for this assessment.
			{:else}
				Students will NOT be able to view their results for this assessment.
			{/if}
		</p>
		<div class="flex gap-2 justify-end">
			<Button variant="secondary" on:click={() => showResultsToggle = false}>Cancel</Button>
			<Button on:click={toggleResultVisibility}>Confirm</Button>
		</div>
	</Modal>
{/if}

<style>
	/* Tailwind handles styling */
</style>
