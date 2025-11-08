<script>
	import { page } from '$app/stores';

	// helper to check active route
	const isActive = (path) => $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
</script>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<div class="flex gap-6">
			<aside class="w-64 bg-white p-4 rounded shadow">
				<h4 class="font-semibold mb-3">Admin</h4>
				<nav class="flex flex-col gap-2 text-sm">
					<a href="/admin" class="px-2 py-1 rounded {isActive('/admin') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Dashboard</a>
					<a href="/admin/assessments" class="px-2 py-1 rounded {isActive('/admin/assessments') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Assessments</a>
					<a href="/admin/assessments/create" class="px-2 py-1 rounded {isActive('/admin/assessments/create') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Create Assessment</a>
					<a href="/admin/classes" class="px-2 py-1 rounded {isActive('/admin/classes') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Classes</a>
					<a href="/admin/subjects" class="px-2 py-1 rounded {isActive('/admin/subjects') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Subjects</a>
					<a href="/admin/students" class="px-2 py-1 rounded {isActive('/admin/students') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}">Students</a>
				</nav>
			</aside>

			<main class="flex-1">
				<slot />
			</main>
		</div>
	</div>
</div>
