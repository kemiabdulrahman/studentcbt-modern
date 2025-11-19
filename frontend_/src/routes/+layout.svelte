<script>
  import '../app.css';
  import { authStore, authLoading, isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/layout/Navbar.svelte';

  // Subscribe to the actual loading state from auth store
  let isLoadingAuth = true;
  let authenticated = false;

  authLoading.subscribe(value => {
    isLoadingAuth = value;
  });

  isAuthenticated.subscribe(value => {
    authenticated = value;
  });

  $: {
    // If not loading and not authenticated, and not on auth page, redirect to login
    if (!isLoadingAuth && !authenticated && !$page.url.pathname.startsWith('/auth')) {
      goto('/auth/login');
    }
  }
</script>

<svelte:head>
  <title>StudentCBT - Computer Based Testing Platform</title>
</svelte:head>

<!-- Navbar - visible on all pages -->
<Navbar />

{#if isLoadingAuth && !$page.url.pathname.startsWith('/auth')}
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading...</p>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  /* Global styles are handled by app.css */
</style>
