<script>
	import { page } from '$app/stores';

	let showSidebar = $state(false);

	// helper to check active route
	const isActive = (path) => $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');

	function toggleSidebar() {
		showSidebar = !showSidebar;
	}

	function closeSidebar() {
		showSidebar = false;
	}

	$effect(() => {
		if ($page.url.pathname) {
			closeSidebar();
		}
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Mobile Sidebar Toggle Button -->
	<div class="lg:hidden bg-white border-b border-gray-200 sticky top-16 z-40">
		<button
			on:click={toggleSidebar}
			class="w-full px-4 py-3 flex items-center gap-2 text-gray-900 hover:bg-gray-50 transition"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
			<span class="font-medium">Navigation</span>
		</button>
	</div>

	<!-- Sidebar Backdrop (Mobile) -->
	{#if showSidebar}
		<div
			class="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30 top-16"
			on:click={closeSidebar}
			on:keydown={(e) => e.key === 'Escape' && closeSidebar()}
			role="button"
			tabindex="0"
		></div>
	{/if}

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<div class="flex gap-4 lg:gap-6">
			<!-- Sidebar -->
			<aside
				class="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-40 lg:relative lg:h-auto lg:w-64 lg:shadow transform transition-transform duration-300 lg:transform-none {showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
			>
				<!-- Mobile header in sidebar -->
				<div class="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
					<h3 class="font-semibold text-gray-900">Menu</h3>
					<button
						on:click={closeSidebar}
						class="p-1 hover:bg-gray-100 rounded transition"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Desktop header in sidebar -->
				<div class="hidden lg:block p-4">
					<h4 class="font-semibold text-gray-900 mb-1">Admin</h4>
					<p class="text-xs text-gray-500">Dashboard</p>
				</div>

				<!-- Navigation -->
				<nav class="flex flex-col gap-1 p-4 pt-0 lg:pt-4 text-sm overflow-y-auto" style="max-height: calc(100vh - 180px)">
					<a
						href="/admin"
						on:click={closeSidebar}
						class="px-3 py-2 rounded-lg transition {isActive('/admin') && !$page.url.pathname.includes('/admin/') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}"
					>
						📊 Dashboard
					</a>
					<a
						href="/admin/assessments"
						on:click={closeSidebar}
						class="px-3 py-2 rounded-lg transition {isActive('/admin/assessments') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}"
					>
						✅ Assessments
					</a>
					<a
						href="/admin/assessments/create"
						on:click={closeSidebar}
						class="px-3 py-2 rounded-lg transition {isActive('/admin/assessments/create') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}"
					>
						➕ Create Assessment
					</a>
					<a
						href="/admin/classes"
						on:click={closeSidebar}
						class="px-3 py-2 rounded-lg transition {isActive('/admin/classes') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}"
					>
						🏫 Classes
					</a>
					<a
						href="/admin/subjects"
						on:click={closeSidebar}
						class="px-3 py-2 rounded-lg transition {isActive('/admin/subjects') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}"
					>
						📚 Subjects
					</a>
					<a
						href="/admin/students"
						on:click={closeSidebar}
						class="px-3 py-2 rounded-lg transition {isActive('/admin/students') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}"
					>
						👥 Students
					</a>
				</nav>
			</aside>

			<main class="flex-1 min-w-0">
				<slot />
			</main>
		</div>
	</div>
</div>
