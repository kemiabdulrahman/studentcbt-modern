<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import api from '$lib/utils/api';

  let assessment = null;
  let error = '';
  let busy = false;
  $: id = $page.params.id;

  onMount(async () => {
    try {
      const resp = await api.student.getAssessmentForExam(id);
      assessment = resp.assessment || resp;
    } catch (err) {
      console.error('Load assessment failed', err);
      error = err.message || 'Failed to load assessment. You may have already attempted this assessment.';
    }
  });

  async function startExam() {
    busy = true;
    try {
      const resp = await api.student.startAssessment(id);
      if (resp.attempt || resp.message) {
        goto(`/student/assessments/${id}/take`);
      }
    } catch (err) {
      console.error('Start exam failed', err);
      error = err.message || 'Failed to start exam';
    } finally {
      busy = false;
    }
  }

  function goBack() {
    goto('/student/assessments');
  }
</script>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-2xl mx-auto px-4">
    <button on:click={goBack} class="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
      &larr; Back
    </button>

    {#if error}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
        {error}
      </div>
      <button on:click={goBack} class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Go to Assessments
      </button>
    {:else if !assessment}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4">Loading assessment...</p>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow p-8">
        <h1 class="text-3xl font-bold mb-2">{assessment.title}</h1>
        <p class="text-gray-600 mb-6">{assessment.subject.name}</p>

        <div class="grid grid-cols-4 gap-4 mb-8">
          <div class="bg-blue-50 p-4 rounded">
            <div class="text-sm text-gray-600">Questions</div>
            <div class="text-2xl font-bold">{assessment.questions.length}</div>
          </div>
          <div class="bg-green-50 p-4 rounded">
            <div class="text-sm text-gray-600">Duration</div>
            <div class="text-2xl font-bold">{assessment.duration} min</div>
          </div>
          <div class="bg-yellow-50 p-4 rounded">
            <div class="text-sm text-gray-600">Total Marks</div>
            <div class="text-2xl font-bold">{assessment.totalMarks}</div>
          </div>
          <div class="bg-purple-50 p-4 rounded">
            <div class="text-sm text-gray-600">Pass Marks</div>
            <div class="text-2xl font-bold">{assessment.passMarks}</div>
          </div>
        </div>

        {#if assessment.description}
          <div class="mb-6 p-4 bg-gray-50 rounded">
            <h3 class="font-semibold mb-2">Description</h3>
            <p class="text-gray-700">{assessment.description}</p>
          </div>
        {/if}

        {#if assessment.instructions}
          <div class="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <h3 class="font-semibold mb-2">Instructions</h3>
            <p class="text-gray-700 whitespace-pre-line">{assessment.instructions}</p>
          </div>
        {/if}

        <div class="mb-6 p-4 bg-blue-50 rounded">
          <h3 class="font-semibold mb-2">Assessment Details</h3>
          <ul class="text-sm text-gray-700 space-y-1">
            <li>• There are {assessment.questions.length} questions in this assessment</li>
            <li>• You have {assessment.duration} minutes to complete it</li>
            <li>• Each question may have different marks</li>
            <li>• You must achieve {assessment.passMarks} marks to pass</li>
            <li>• Once started, you cannot pause the assessment</li>
            <li>• You can only attempt this assessment once</li>
          </ul>
        </div>

        <div class="flex gap-3">
          <button on:click={startExam} disabled={busy} class="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:bg-gray-400 transition">
            {busy ? 'Starting...' : 'Start Assessment'}
          </button>
          <button on:click={goBack} class="flex-1 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400 transition">
            Cancel
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Tailwind handles styling */
</style>
