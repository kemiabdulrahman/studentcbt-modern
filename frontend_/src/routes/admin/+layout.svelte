<script>
	import { page } from '$app/stores';
	let sidebarOpen = false;

	// helper to check active route - only one nav item should be active
	const isActive = (path) => {
		const pathname = $page.url.pathname;
		// Exact match has priority
		if (pathname === path) return true;
		// For parent routes, only match if it's the main route and not a sub-route with its own nav item
		if (path === '/admin' && pathname === '/admin') return true;
		if (path === '/admin/assessments' && pathname.startsWith('/admin/assessments') && !pathname.startsWith('/admin/assessments/create')) return true;
		if (path === '/admin/assessments/create' && pathname.startsWith('/admin/assessments/create')) return true;
		if (path === '/admin/classes' && pathname.startsWith('/admin/classes')) return true;
		if (path === '/admin/subjects' && pathname.startsWith('/admin/subjects')) return true;
		if (path === '/admin/students' && pathname.startsWith('/admin/students')) return true;
		return false;
	};
	
	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
	
	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Mobile Header -->
	<div class="lg:hidden bg-white shadow sticky top-0 z-40 p-4 flex justify-between items-center">
		<h3 class="font-semibold text-gray-900">Admin Menu</h3>
		<button 
			on:click={toggleSidebar} 
			class="p-2 rounded hover:bg-gray-100 z-50"
			aria-label="Toggle navigation menu"
			title="Toggle menu"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
	</div>

	<!-- Overlay for mobile -->
	{#if sidebarOpen}
		<div 
			class="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30" 
			on:click={closeSidebar}
			on:keydown={(e) => e.key === 'Escape' && closeSidebar()}
			role="button"
			tabindex="0"
			aria-label="Close navigation menu"
		></div>
	{/if}

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<div class="flex gap-6">
			<!-- Sidebar -->
			<aside class="{sidebarOpen ? 'fixed left-0 top-16 z-40 w-64' : 'hidden'} lg:relative lg:block lg:top-auto w-64 bg-white p-4 rounded shadow">
				<h4 class="font-semibold mb-3">Admin</h4>
				<nav class="flex flex-col gap-2 text-sm">
					<a href="/admin" on:click={closeSidebar} class="px-2 py-1 rounded {isActive('/admin') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Dashboard</a>
					<a href="/admin/assessments" on:click={closeSidebar} class="px-2 py-1 rounded {isActive('/admin/assessments') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Assessments</a>
					<a href="/admin/assessments/create" on:click={closeSidebar} class="px-2 py-1 rounded {isActive('/admin/assessments/create') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Create Assessment</a>
					<a href="/admin/classes" on:click={closeSidebar} class="px-2 py-1 rounded {isActive('/admin/classes') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Classes</a>
					<a href="/admin/subjects" on:click={closeSidebar} class="px-2 py-1 rounded {isActive('/admin/subjects') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Subjects</a>
					<a href="/admin/students" on:click={closeSidebar} class="px-2 py-1 rounded {isActive('/admin/students') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Students</a>
				</nav>
			</aside>

			<main class="flex-1 w-full">
				<slot />
			</main>
		</div>
	</div>
</div>
