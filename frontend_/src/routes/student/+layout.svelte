<script>
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let sidebarOpen = $state(false);

	function isActive(path) {
		return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
	}

	function logout() {
		authStore.logout();
		goto('/auth/login');
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Mobile Header -->
	<div class="md:hidden bg-white border-b p-4 flex justify-between items-center">
		<h1 class="text-xl font-bold">StudentCBT</h1>
		<button on:click={() => sidebarOpen = !sidebarOpen} class="p-2 hover:bg-gray-100">
			☰
		</button>
	</div>

	<div class="flex">
		<!-- Sidebar -->
		<aside class="w-64 bg-white border-r hidden md:block sticky top-0 h-screen overflow-y-auto">
			<div class="p-4">
				<h1 class="text-2xl font-bold mb-6">StudentCBT</h1>
				<nav class="space-y-2">
					<a 
						href="/student" 
						class="block px-4 py-2 rounded transition {isActive('/student') && !isActive('/student/assessments') && !isActive('/student/results') && !isActive('/student/settings') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}"
					>
						Dashboard
					</a>
					<a 
						href="/student/assessments" 
						class="block px-4 py-2 rounded transition {isActive('/student/assessments') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}"
					>
						Assessments
					</a>
					<a 
						href="/student/results" 
						class="block px-4 py-2 rounded transition {isActive('/student/results') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}"
					>
						Results
					</a>
					<a 
						href="/student/settings" 
						class="block px-4 py-2 rounded transition {isActive('/student/settings') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}"
					>
						Settings
					</a>
				</nav>
			</div>

			<div class="p-4 border-t absolute bottom-0 w-full">
				<div class="p-3 bg-gray-50 rounded mb-3">
					<p class="text-sm font-semibold text-gray-700">{$authStore.user?.student?.firstName || 'Student'}</p>
					<p class="text-xs text-gray-600">{$authStore.user?.email}</p>
				</div>
				<button 
					on:click={logout}
					class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
				>
					Logout
				</button>
			</div>
		</aside>

		<!-- Mobile Sidebar -->
		{#if sidebarOpen}
			<div class="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40" on:click={() => sidebarOpen = false}></div>
			<aside class="fixed left-0 top-0 w-64 h-screen bg-white md:hidden z-50 overflow-y-auto">
				<div class="p-4">
					<h1 class="text-2xl font-bold mb-6">StudentCBT</h1>
					<nav class="space-y-2">
						<a 
							href="/student" 
							on:click={() => sidebarOpen = false}
							class="block px-4 py-2 rounded transition {isActive('/student') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}"
						>
							Dashboard
						</a>
						<a 
							href="/student/assessments" 
							on:click={() => sidebarOpen = false}
							class="block px-4 py-2 rounded transition {isActive('/student/assessments') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}"
						>
							Assessments
						</a>
						<a 
							href="/student/results" 
							on:click={() => sidebarOpen = false}
							class="block px-4 py-2 rounded transition {isActive('/student/results') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}"
						>
							Results
						</a>
						<a 
							href="/student/settings" 
							on:click={() => sidebarOpen = false}
							class="block px-4 py-2 rounded transition {isActive('/student/settings') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}"
						>
							Settings
						</a>
					</nav>
				</div>
			</aside>
		{/if}

		<!-- Main Content -->
		<main class="flex-1">
			<slot />
		</main>
	</div>
</div>

<style>
	/* Tailwind handles styling */
</style>
