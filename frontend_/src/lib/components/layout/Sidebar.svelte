<script>
	import { page } from '$app/stores';
	import { sidebarOpen } from '$stores/ui';
	import { isAdmin, isStudent } from '$stores/auth';
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
		Upload
	} from 'lucide-svelte';

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

	function closeSidebar() {
		sidebarOpen.set(false);
	}
</script>

<!-- Mobile sidebar overlay -->
{#if $sidebarOpen}
	<div 
		class="fixed inset-0 z-40 lg:hidden"
		role="presentation"
		on:click={closeSidebar}
	>
		<div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
	</div>
{/if}

<!-- Sidebar -->
<div class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 {$sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:inset-0">
	<div class="flex h-full flex-col">
		<!-- Logo -->
		<div class="flex h-16 flex-shrink-0 items-center px-6 bg-gray-800">
			<img class="h-8 w-auto" src="/favicon.png" alt="StudentCBT" />
			<span class="ml-2 text-xl font-semibold text-white">StudentCBT</span>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1 px-3 py-4">
			{#each navigation as item}
				<a>
					href={item.href}
					class="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors {isActivePath(item.href)
						? 'bg-gray-800 text-white'
						: 'text-gray-300 hover:bg-gray-700 hover:text-white'}"
					on:click={closeSidebar}
					<svelte:component 
						this={item.icon} 
						class="mr-3 h-5 w-5 flex-shrink-0 {isActivePath(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'}" 
					/>
					{item.name}
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="flex flex-shrink-0 bg-gray-800 p-4">
			<div class="w-full text-center">
				<p class="text-xs text-gray-400">
					{isAdminUser ? 'Administrator Panel' : 'Student Portal'}
				</p>
			</div>
		</div>
	</div>
</div>