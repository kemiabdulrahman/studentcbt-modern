<script>
  import '../app.css';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/layout/Navbar.svelte';

  // Svelte 5: Use $props for component props
  let { data } = $props();

  // Derived reactive values
  let isPublicPath = $derived(
    $page.url.pathname.startsWith('/auth') || $page.url.pathname === '/'
  );
  let shouldRedirect = $derived(!data.auth?.isAuthenticated && !isPublicPath);

  // Reactive effect for redirect
  $effect(() => {
    if (shouldRedirect) {
      goto('/auth/login');
    }
  });
</script>

<svelte:head>
  <title>StudentCBT - Computer Based Testing Platform</title>
</svelte:head>

<!-- Navbar - visible on all pages -->
<Navbar />

<slot />

<style>
  /* Global styles are handled by app.css */
</style>
