<script>
	import { onMount } from 'svelte';
	import { authStore, authLoading } from '$stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Header from './Header.svelte';
	import Sidebar from './Sidebar.svelte';
	import ToastContainer from '$components/ui/ToastContainer.svelte';
	import LoadingSpinner from '$components/ui/LoadingSpinner.svelte';

	export let requireAuth = true;
	export let allowedRoles = ['ADMIN', 'STUDENT'];

	$: user = $authStore.user;
	$: isAuthenticated = $authStore.isAuthenticated;
	$: loading = $authLoading;

	onMount(() => {
		// Check authentication and role permissions
		if (requireAuth && !loading && !isAuthenticated) {
			goto('/auth/login');
			return;
		}

		if (requireAuth && user && !allowedRoles.includes(user.role)) {
			// Redirect to appropriate dashboard based on role
			const dashboardPath = user.role === 'ADMIN' ? '/admin' : '/student';
			goto(dashboardPath);
		}
	});

	// Show loading spinner while checking auth
	$: if (loading) {
		// Show loading state
	}
</script>

{#if loading}
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<div class="text-center">
			<LoadingSpinner size="lg" />
			<p class="mt-2 text-sm text-gray-600">Loading...</p>
		</div>
	</div>
{:else if requireAuth && !isAuthenticated}
	<!-- Will redirect to login -->
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<LoadingSpinner size="lg" />
	</div>
{:else}
	<div class="min-h-screen bg-gray-50">
		<Sidebar />
		
		<div class="lg:pl-64">
			<Header />
			
			<main class="py-6">
				<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<slot />
				</div>
			</main>
		</div>
	</div>

	<!-- Toast notifications -->
	<ToastContainer />
{/if}