<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore, currentUser, userRole, isAdmin, isStudent } from '$lib/stores/auth';
	import { 
		Home, 
		Users, 
		BookOpen, 
		FileText, 
		BarChart3, 
		Settings,
		GraduationCap,
		ClipboardList,
		Trophy,
		Upload,
		LogOut,
		ChevronLeft,
		Menu
	} from 'lucide-svelte';

	let user = null;
	let role = null;
	let isCollapsed = false;
	let showMenu = false;

	currentUser.subscribe(value => {
		user = value;
	});

	userRole.subscribe(value => {
		role = value;
	});

	$: currentPath = $page.url.pathname;
	$: isAdminUser = $isAdmin;
	$: isStudentUser = $isStudent;

	const adminNavigation = [
		{ name: 'Dashboard', href: '/admin', icon: Home },
		{ name: 'Students', href: '/admin/students', icon: Users },
		{ name: 'Classes', href: '/admin/classes', icon: GraduationCap },
		{ name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
		{ name: 'Assessments', href: '/admin/assessments', icon: FileText },
		{ name: 'Results', href: '/admin/results', icon: Trophy },
		{ name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
		{ name: 'Upload', href: '/admin/upload', icon: Upload },
		{ name: 'Settings', href: '/admin/settings', icon: Settings }
	];

	const studentNavigation = [
		{ name: 'Dashboard', href: '/student', icon: Home },
		{ name: 'Assessments', href: '/student/assessments', icon: ClipboardList },
		{ name: 'Results', href: '/student/results', icon: Trophy },
		{ name: 'Profile', href: '/student/profile', icon: Settings }
	];

	$: navigation = isAdminUser ? adminNavigation : studentNavigation;

	function isActivePath(href) {
		if (href === '/admin' || href === '/student') {
			return currentPath === href;
		}
		return currentPath.startsWith(href);
	}

	function toggleSidebar() {
		isCollapsed = !isCollapsed;
	}

	function handleLogout() {
		authStore.logout();
		goto('/auth/login');
	}

	function handleNavClick() {
		// Don't close on mobile if navigating
		if (window.innerWidth < 1024) {
			// Mobile behavior can be customized here
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Top Navigation Bar -->
	<nav class="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
		<div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Left: Logo and Brand -->
				<div class="flex items-center gap-3">
					<button
						on:click={toggleSidebar}
						class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
						title="Toggle sidebar"
					>
						{#if isCollapsed}
							<Menu class="w-6 h-6" />
						{:else}
							<ChevronLeft class="w-6 h-6" />
						{/if}
					</button>
					<div class="flex items-center gap-2 cursor-pointer" on:click={() => goto('/')}>
						<div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
							<span class="text-white font-bold text-lg">CBT</span>
						</div>
						<h1 class="text-xl font-bold text-gray-900 hidden sm:block">StudentCBT</h1>
					</div>
				</div>

				<!-- Right: User Menu -->
				{#if user}
					<div class="flex items-center gap-4">
						<div class="hidden sm:flex items-center gap-2">
							<div class="text-right">
								<p class="text-sm font-medium text-gray-900">
									{user.firstName || 'User'} {user.lastName || ''}
								</p>
								<p class="text-xs text-gray-500">
									{#if role === 'ADMIN'}
										Administrator
									{:else if role === 'STUDENT'}
										Student
									{/if}
								</p>
							</div>
						</div>
						<button
							on:click={handleLogout}
							class="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-600 hover:text-red-600"
							title="Logout"
						>
							<LogOut class="w-5 h-5" />
						</button>
					</div>
				{/if}
			</div>
		</div>
	</nav>

	<div class="flex">
		<!-- Collapsible Sidebar -->
		<div
			class="transition-all duration-300 ease-in-out {isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-gray-100 flex flex-col"
			on:mouseenter={() => {
				// Optional: expand on hover when collapsed
				// isCollapsed = false;
			}}
			on:mouseleave={() => {
				// Optional: collapse on mouse leave
				// isCollapsed = true;
			}}
		>
			<!-- Sidebar Header -->
			<div class="h-16 flex items-center justify-center px-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
				{#if !isCollapsed}
					<div class="text-center">
						<p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
					</div>
				{/if}
			</div>

			<!-- Navigation Items -->
			<nav class="flex-1 overflow-y-auto px-3 py-4 space-y-2">
				{#each navigation as item}
					<a
						href={item.href}
						on:click={handleNavClick}
						class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group {isActivePath(item.href)
							? 'bg-indigo-600 text-white'
							: 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}"
						title={item.name}
					>
						<svelte:component
							this={item.icon}
							class="w-5 h-5 flex-shrink-0 {isActivePath(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}"
						/>
						{#if !isCollapsed}
							<span class="text-sm font-medium">{item.name}</span>
						{/if}
					</a>
				{/each}
			</nav>

			<!-- Sidebar Footer -->
			<div class="p-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
				{#if !isCollapsed}
					<p class="text-xs text-gray-400 text-center">
						{isAdminUser ? 'Admin Panel' : 'Student Portal'}
					</p>
				{:else}
					<div class="text-center text-xs text-gray-400">
						{isAdminUser ? 'A' : 'S'}
					</div>
				{/if}
			</div>
		</div>

		<!-- Main Content Area -->
		<div class="flex-1 overflow-auto">
			<slot />
		</div>
	</div>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}
</style>
