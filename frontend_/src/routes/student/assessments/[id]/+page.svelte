<script>
  import { goto } from '$app/navigation';

  // Props using Svelte 5 runes
  let { data, form } = $props();

  let busy = $state(false);
  let error = $state('');

  /**
   * Handle exam start via server action
   * This calls the +page.server.js action which keeps the API call secure
   */
  async function startExam() {
    busy = true;
    error = '';

    try {
      // Create a form element to submit the server action
      const formData = new FormData();
      
      // Use the enhance action to handle the form submission
      const response = await fetch(`?/startAssessment`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to take exam page
        goto(`/student/assessments/${data.assessmentId}/take`);
      } else if (result.error) {
        error = result.error;
      }
    } catch (err) {
      console.error('Start exam failed:', err);
      error = err.message || 'Failed to start exam';
    } finally {
      busy = false;
    }
  }

  /**
   * Better approach: use the form action with SvelteKit's progressive enhancement
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    startExam();
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

    {#if data.error}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
        {data.error}
      </div>
      <button on:click={goBack} class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Go to Assessments
      </button>
    {:else if error}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
        {error}
      </div>
    {:else if data.assessment}
      <div class="bg-white rounded-lg shadow p-8">
        <h1 class="text-3xl font-bold mb-2">{data.assessment.title}</h1>
        <p class="text-gray-600 mb-6">{data.assessment.subject.name}</p>

        <div class="grid grid-cols-4 gap-4 mb-8">
          <div class="bg-blue-50 p-4 rounded">
            <div class="text-sm text-gray-600">Questions</div>
            <div class="text-2xl font-bold">{data.assessment.questions?.length || data.assessment._count?.questions || 0}</div>
          </div>
          <div class="bg-green-50 p-4 rounded">
            <div class="text-sm text-gray-600">Duration</div>
            <div class="text-2xl font-bold">{data.assessment.duration} min</div>
          </div>
          <div class="bg-yellow-50 p-4 rounded">
            <div class="text-sm text-gray-600">Total Marks</div>
            <div class="text-2xl font-bold">{data.assessment.totalMarks}</div>
          </div>
          <div class="bg-purple-50 p-4 rounded">
            <div class="text-sm text-gray-600">Pass Marks</div>
            <div class="text-2xl font-bold">{data.assessment.passMarks}</div>
          </div>
        </div>

        {#if data.assessment.description}
          <div class="mb-6 p-4 bg-gray-50 rounded">
            <h3 class="font-semibold mb-2">Description</h3>
            <p class="text-gray-700">{data.assessment.description}</p>
          </div>
        {/if}

        {#if data.assessment.instructions}
          <div class="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <h3 class="font-semibold mb-2">Instructions</h3>
            <p class="text-gray-700 whitespace-pre-line">{data.assessment.instructions}</p>
          </div>
        {/if}

        <div class="mb-6 p-4 bg-blue-50 rounded">
          <h3 class="font-semibold mb-2">Assessment Details</h3>
          <ul class="text-sm text-gray-700 space-y-1">
            <li>• There are {data.assessment.questions?.length || data.assessment._count?.questions || 0} questions in this assessment</li>
            <li>• You have {data.assessment.duration} minutes to complete it</li>
            <li>• Each question may have different marks</li>
            <li>• You must achieve {data.assessment.passMarks} marks to pass</li>
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
