<script>
	import { page } from '$app/stores';
	import { authStore, currentUser, isAdmin } from '$stores/auth';
	import { sidebarOpen } from '$stores/ui';
	import { Menu, Bell, User, LogOut, Settings } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import { modalStore } from '$stores/ui';
	import { goto } from '$app/navigation';

	let showUserMenu = false;

	$: user = $currentUser;
	$: isAdminUser = $isAdmin;

	function toggleSidebar() {
		sidebarOpen.update(open => !open);
	}

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function closeUserMenu() {
		showUserMenu = false;
	}

	function handleLogout() {
		authStore.logout();
		goto('/auth/login');
		closeUserMenu();
	}

	function openChangePassword() {
		modalStore.open({
			component: 'ChangePasswordModal'
		});
		closeUserMenu();
	}

	// Close user menu when clicking outside
	function handleClickOutside(event) {
		if (!event.target.closest('.user-menu')) {
			closeUserMenu();
		}
	}

	$: if (showUserMenu && typeof window !== 'undefined') {
		document.addEventListener('click', handleClickOutside);
	} else if (typeof window !== 'undefined') {
		document.removeEventListener('click', handleClickOutside);
	}
</script>

<header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
	<div class="mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 justify-between items-center">
			<!-- Left side -->
			<div class="flex items-center">
				<!-- Mobile menu button -->
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
					on:click={toggleSidebar}
				>
					<Menu class="h-6 w-6" />
				</button>

				<!-- Logo and title -->
				<div class="flex items-center ml-4 lg:ml-0">
					<div class="flex-shrink-0">
						<img 
							class="h-8 w-8" 
							src="/favicon.png" 
							alt="StudentCBT"
						/>
					</div>
					<div class="ml-2">
						<h1 class="text-xl font-semibold text-gray-900">
							StudentCBT
						</h1>
					</div>
				</div>
			</div>

			<!-- Right side -->
			<div class="flex items-center space-x-4">
				<!-- Notifications -->
				<button
					type="button"
					class="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
				>
					<Bell class="h-6 w-6" />
				</button>

				<!-- User menu -->
				<div class="relative user-menu">
					<button
						type="button"
						class="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
						on:click={toggleUserMenu}
					>
						<div class="flex items-center space-x-3 p-2">
							<div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
								<span class="text-sm font-medium text-white">
									{user?.student?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
								</span>
							</div>
							<div class="hidden md:block text-left">
								<p class="text-sm font-medium text-gray-700">
									{user?.student ? `${user.student.firstName} ${user.student.lastName}` : user?.email}
								</p>
								<p class="text-xs text-gray-500">
									{isAdminUser ? 'Administrator' : 'Student'}
								</p>
							</div>
						</div>
					</button>

					{#if showUserMenu}
						<div class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							<div class="px-4 py-3 border-b border-gray-200">
								<p class="text-sm font-medium text-gray-900">
									{user?.student ? `${user.student.firstName} ${user.student.lastName}` : user?.email}
								</p>
								<p class="text-sm text-gray-500">
									{user?.email}
								</p>
							</div>

							
								href="/profile"
								class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								on:click={closeUserMenu}
							>
								<User class="mr-3 h-4 w-4" />
								Your Profile
							</a>

							<button
								type="button"
								class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								on:click={openChangePassword}
							>
								<Settings class="mr-3 h-4 w-4" />
								Change Password
							</button>

							<button
								type="button"
								class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200"
								on:click={handleLogout}
							>
								<LogOut class="mr-3 h-4 w-4" />
								Sign out
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</header>