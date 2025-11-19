<script>
	import { onMount } from 'svelte';
	import { authStore } from '$stores/auth';
	import { goto } from '$app/navigation';
	import ToastContainer from '$components/ui/ToastContainer.svelte';

	$: user = $authStore.user;
	$: isAuthenticated = $authStore.isAuthenticated;

	onMount(() => {
		// Redirect authenticated users to their dashboard
		if (isAuthenticated && user) {
			const dashboardPath = user.role === 'ADMIN' ? '/admin' : '/student';
			goto(dashboardPath);
		}
	});
</script>

{#if !isAuthenticated}
	<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
		<div class="max-w-md w-full space-y-8">
			<div class="text-center">
				<img class="mx-auto h-12 w-auto" src="/favicon.png" alt="StudentCBT" />
				<h1 class="mt-6 text-3xl font-extrabold text-gray-900">
					StudentCBT
				</h1>
				<p class="mt-2 text-sm text-gray-600">
					Computer Based Testing System
				</p>
			</div>
			
			<div class="bg-white py-8 px-6 shadow rounded-lg">
				<slot />
			</div>
		</div>
	</div>

	<!-- Toast notifications -->
	<ToastContainer />
{:else}
	<!-- Will redirect to dashboard -->
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
			<p class="mt-2 text-sm text-gray-600">Redirecting...</p>
		</div>
	</div>
{/if}