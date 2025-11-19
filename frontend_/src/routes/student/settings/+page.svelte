<script>
	import ChangePassword from '$lib/components/auth/ChangePassword.svelte';
	import { authStore } from '$lib/stores/auth';
	import { toastStore } from '$lib/stores/ui';
	import api from '$lib/utils/api';

	let { data } = $props();

	let currentUser = $state(data?.profile || {});
	let showPasswordForm = $state(false);

	async function loadProfile() {
		try {
			const resp = await api.auth.getProfile();
			currentUser = resp.user;
		} catch (err) {
			console.error('Load profile failed', err);
			toastStore.error('Failed to load profile');
		}
	}

	function handlePasswordChange() {
		showPasswordForm = false;
		toastStore.success('Password changed successfully');
		loadProfile();
	}
</script>

<div class="p-6 md:p-8 max-w-4xl mx-auto">
	<h1 class="text-3xl font-bold mb-6">Settings & Profile</h1>

	<!-- Profile Section -->
	<div class="bg-white rounded-lg shadow p-6 mb-6">
		<h2 class="text-2xl font-bold mb-4">Profile Information</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
					<div class="px-4 py-3 bg-gray-50 rounded border border-gray-200 text-gray-900">
						{currentUser.name || 'N/A'}
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
					<div class="px-4 py-3 bg-gray-50 rounded border border-gray-200 text-gray-900">
						{currentUser.email || 'N/A'}
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
					<div class="px-4 py-3 bg-gray-50 rounded border border-gray-200">
						<span class="inline-block px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm font-medium">
							{currentUser.role || 'N/A'}
						</span>
					</div>
				</div>

				{#if currentUser.student?.class}
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Class</label>
						<div class="px-4 py-3 bg-gray-50 rounded border border-gray-200 text-gray-900">
							{currentUser.student.class.name || 'N/A'}
						</div>
					</div>
				{/if}

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
					<div class="px-4 py-3 bg-gray-50 rounded border border-gray-200">
						{#if currentUser.isActive}
							<span class="inline-block px-3 py-1 rounded bg-green-100 text-green-800 text-sm font-medium">
								Active
							</span>
						{:else}
							<span class="inline-block px-3 py-1 rounded bg-red-100 text-red-800 text-sm font-medium">
								Inactive
							</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Security Section -->
		<div class="bg-white rounded-lg shadow p-6 mb-6">
			<h2 class="text-2xl font-bold mb-4">Security</h2>

			<div class="mb-4">
				<p class="text-gray-700 mb-4">
					Manage your password and security settings to keep your account safe.
				</p>
			</div>

			{#if !showPasswordForm}
				<button
					on:click={() => (showPasswordForm = true)}
					class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition"
				>
					Change Password
				</button>
			{:else}
				<div class="bg-gray-50 p-6 rounded border border-gray-200">
					<div class="mb-4">
						<button
							on:click={() => (showPasswordForm = false)}
							class="text-gray-600 hover:text-gray-800 text-sm font-medium"
						>
							← Back
						</button>
					</div>
					<ChangePassword on:success={handlePasswordChange} />
				</div>
			{/if}
		</div>

		<!-- Session Information -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-2xl font-bold mb-4">Session</h2>

			<p class="text-gray-700 mb-4">
				You are currently logged in. Click below to log out of your account.
			</p>

			<button
				on:click={() => {
					authStore.logout();
					window.location.href = '/auth/login';
				}}
				class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition"
			>
				Logout
			</button>
		</div>
</div>

<style>
	/* Tailwind handles styling */
</style>
