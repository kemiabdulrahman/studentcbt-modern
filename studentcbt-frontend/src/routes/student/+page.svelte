<script>
  import { onMount } from 'svelte';
  import api from '$lib/utils/api';
  import { authStore } from '$lib/stores/auth';

  let statistics = {
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
    averageScore: 0
  };
  let recentAttempts = [];
  let error = '';
  let user = null;

  onMount(async () => {
    user = $authStore.user;
    try {
      const resp = await api.student.getDashboard();
      statistics = resp.statistics || {};
      recentAttempts = resp.recentAttempts || [];
    } catch (err) {
      console.error('Dashboard load failed', err);
      error = err.message || 'Failed to load dashboard';
    }
  });

  function getGradeColor(percentage) {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }
</script>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if error}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
        {error}
      </div>
    {/if}

    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Welcome, {user?.student?.firstName || 'Student'}!</h1>
      <p class="text-gray-600 mt-1">Class: {user?.student?.class?.name || 'N/A'}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="p-6 bg-white rounded-lg shadow">
        <div class="text-sm text-gray-600">Total Assessments</div>
        <div class="text-4xl font-bold text-blue-600">{statistics.totalAssessments}</div>
      </div>

      <div class="p-6 bg-white rounded-lg shadow">
        <div class="text-sm text-gray-600">Completed</div>
        <div class="text-4xl font-bold text-green-600">{statistics.completedAssessments}</div>
      </div>

      <div class="p-6 bg-white rounded-lg shadow">
        <div class="text-sm text-gray-600">Pending</div>
        <div class="text-4xl font-bold text-orange-600">{statistics.pendingAssessments}</div>
      </div>

      <div class="p-6 bg-white rounded-lg shadow">
        <div class="text-sm text-gray-600">Average Score</div>
        <div class="text-4xl font-bold text-indigo-600">{statistics.averageScore?.toFixed(1) || 0}%</div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <a href="/student/assessments" class="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow hover:shadow-lg transition">
        <div class="text-2xl font-bold">Take Assessment</div>
        <p class="mt-2 text-blue-100">Start or continue an assessment</p>
      </a>

      <a href="/student/results" class="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow hover:shadow-lg transition">
        <div class="text-2xl font-bold">View Results</div>
        <p class="mt-2 text-green-100">Review completed assessments</p>
      </a>

      <div class="p-6 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-lg shadow">
        <div class="text-2xl font-bold">Profile</div>
        <p class="mt-2 text-gray-100">Change password</p>
      </div>
    </div>

    {#if recentAttempts.length > 0}
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-4">Recent Attempts</h2>
        <div class="space-y-3">
          {#each recentAttempts as attempt}
            <div class="flex items-center justify-between border-b pb-3">
              <div>
                <div class="font-semibold">{attempt.assessment.title}</div>
                <div class="text-sm text-gray-600">{attempt.assessment.subject.name}</div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="font-bold">{attempt.totalScore} / {attempt.assessment.totalMarks}</div>
                  <div class="text-sm text-gray-600">{attempt.percentage?.toFixed(1) || 0}%</div>
                </div>
                <div class="px-3 py-1 rounded text-sm font-medium {getGradeColor(attempt.percentage || 0)}">
                  {attempt.percentage >= attempt.assessment.passMarks ? 'Pass' : 'Fail'}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Tailwind handles styling */
</style>
