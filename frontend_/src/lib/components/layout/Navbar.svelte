<script>
	import { authStore, currentUser, userRole } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let user = null;
	let role = null;
	let showMenu = false;

	currentUser.subscribe(value => {
		user = value;
	});

	userRole.subscribe(value => {
		role = value;
	});

	async function handleLogout() {
		authStore.logout();
		showMenu = false;
		goto('/auth/login');
	}

	function toggleMenu() {
		showMenu = !showMenu;
	}
</script>

<nav class="bg-white shadow-md sticky top-0 z-50">
	<div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo/Brand -->
			<div class="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0" on:click={() => goto('/')}>
				<div class="w-9 sm:w-10 h-9 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
					<span class="text-white font-bold text-sm sm:text-lg">CBT</span>
				</div>
				<h1 class="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">StudentCBT</h1>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center gap-4 lg:gap-6">
				{#if user}
					<div class="flex items-center gap-2">
						<div class="text-right">
							<p class="text-sm font-medium text-gray-900">
								{user.firstName || 'User'} {user.lastName || ''}
							</p>
							<p class="text-xs text-gray-500">
								{#if role === 'ADMIN'}
									Administrator
								{:else if role === 'STUDENT'}
									Student
								{:else}
									User
								{/if}
							</p>
						</div>
						<div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
							<span class="text-white font-semibold text-sm">
								{(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'S')}
							</span>
						</div>
					</div>

					<button
						on:click={handleLogout}
						class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
					>
						Logout
					</button>
				{:else}
					<button
						on:click={() => goto('/auth/login')}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
					>
						Login
					</button>
				{/if}
			</div>

			<!-- Mobile Menu Button -->
			<button
				on:click={toggleMenu}
				class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if showMenu}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>

		<!-- Mobile Menu -->
		{#if showMenu}
			<div class="md:hidden border-t border-gray-200 py-4">
				{#if user}
					<div class="mb-4 p-3 bg-gray-50 rounded">
						<p class="text-sm font-medium text-gray-900">
							{user.firstName || 'User'} {user.lastName || ''}
						</p>
						<p class="text-xs text-gray-500">
							{#if role === 'ADMIN'}
								Administrator
							{:else if role === 'STUDENT'}
								Student
							{:else}
								User
							{/if}
						</p>
					</div>

					<button
						on:click={handleLogout}
						class="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-left"
					>
						Logout
					</button>
				{:else}
					<button
						on:click={() => goto('/auth/login')}
						class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
					>
						Login
					</button>
				{/if}
			</div>
		{/if}
	</div>
</nav>

<style>
	nav {
		position: sticky;
		top: 0;
	}
</style>
