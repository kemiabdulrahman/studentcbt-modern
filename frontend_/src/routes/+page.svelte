<script>
	import { goto } from '$app/navigation';
	import { authStore, isAuthenticated, userRole } from '$lib/stores/auth';

	let currentUser = null;
	let role = null;
	let shouldRedirect = false;

	// Subscribe to auth store to get current user
	const unsubscribeAuth = authStore.subscribe(auth => {
		currentUser = auth.user;
		// Auto-redirect authenticated users based on their role
		if (auth.user?.id && !shouldRedirect) {
			shouldRedirect = true;
			if (auth.user.role === 'ADMIN') {
				goto('/admin');
			} else if (auth.user.role === 'STUDENT') {
				goto('/student');
			}
		}
	});

	userRole.subscribe(r => {
		role = r;
	});
</script>

<svelte:head>
	<title>StudentCBT - Home</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
	<!-- Navigation Header -->
	<header class="bg-white shadow-sm">
		<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
					<span class="text-white font-bold text-lg">CBT</span>
				</div>
				<h1 class="text-2xl font-bold text-gray-900">StudentCBT</h1>
			</div>
			<div class="flex gap-4">
				{#if currentUser}
					<button 
						on:click={() => goto('/auth/login')}
						class="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
					>
						Logout
					</button>
				{:else}
					<button 
						on:click={() => goto('/auth/login')}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
					>
						Login
					</button>
				{/if}
			</div>
		</nav>
	</header>

	<!-- Hero Section -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		{#if currentUser?.id}
			<!-- Authenticated User -->
			<div class="text-center mb-12">
				<h2 class="text-4xl font-bold text-gray-900 mb-4">
					Welcome back, {currentUser.firstName || 'User'}!
				</h2>
				<p class="text-xl text-gray-600">
					{#if role === 'ADMIN'}
						You are logged in as an Administrator
					{:else if role === 'STUDENT'}
						You are logged in as a Student
					{/if}
				</p>
			</div>

			<!-- Quick Actions -->
			<div class="grid md:grid-cols-2 gap-6 mb-12">
				{#if role === 'ADMIN'}
					<a 
						href="/admin"
						class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-600"
					>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
						<p class="text-gray-600">Manage assessments, students, classes, and subjects</p>
					</a>
				{:else if role === 'STUDENT'}
					<a 
						href="/student"
						class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-600"
					>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Student Dashboard</h3>
						<p class="text-gray-600">View available assessments and your results</p>
					</a>
				{/if}
			</div>
		{:else}
			<!-- Unauthenticated User -->
			<div class="text-center mb-12">
				<h2 class="text-4xl font-bold text-gray-900 mb-4">
					Welcome to StudentCBT
				</h2>
				<p class="text-xl text-gray-600 mb-8">
					A comprehensive Computer-Based Testing platform for modern education
				</p>
				<button 
					on:click={() => goto('/auth/login')}
					class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
				>
					Get Started
				</button>
			</div>

			<!-- Features Section -->
			<div class="grid md:grid-cols-3 gap-6 mb-12">
				<div class="bg-white p-6 rounded-lg shadow">
					<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Easy to Use</h3>
					<p class="text-gray-600">Intuitive interface designed for both teachers and students</p>
				</div>

				<div class="bg-white p-6 rounded-lg shadow">
					<div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
					<p class="text-gray-600">Enterprise-grade security with JWT authentication</p>
				</div>

				<div class="bg-white p-6 rounded-lg shadow">
					<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
					<p class="text-gray-600">Detailed insights and performance tracking</p>
				</div>
			</div>

			<!-- CTA Section -->
			<div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-center text-white">
				<h3 class="text-2xl font-bold mb-4">Ready to get started?</h3>
				<p class="mb-6 text-blue-100">Login to your account or contact your administrator for access</p>
				<button 
					on:click={() => goto('/auth/login')}
					class="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
				>
					Login Now
				</button>
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="bg-white border-t border-gray-200 mt-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
			<p>&copy; 2025 StudentCBT. All rights reserved.</p>
			<p class="mt-2 text-sm">
				API Documentation: 
				<a href="http://localhost:5000/api-docs" target="_blank" class="text-blue-600 hover:underline">Swagger UI</a>
				| 
				<a href="http://localhost:5000/redoc-online" target="_blank" class="text-blue-600 hover:underline">ReDoc</a>
			</p>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
