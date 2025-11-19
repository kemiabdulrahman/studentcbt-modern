<script>
	import { createEventDispatcher } from 'svelte';
	import { api } from '$utils/api';
	import { toastStore } from '$stores/ui';
	import { validateForm, changePasswordSchema } from '$utils/validation';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';
	import Alert from '$components/ui/Alert.svelte';

	const dispatch = createEventDispatcher();

	let formData = {
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	};
	
	let errors = {};
	let loading = false;
	let generalError = '';

	async function handleSubmit() {
		// Reset errors
		errors = {};
		generalError = '';

		// Validate form
		const validation = validateForm(changePasswordSchema, formData);
		if (!validation.success) {
			errors = validation.errors;
			return;
		}

		loading = true;

		try {
			await api.auth.changePassword({
				currentPassword: formData.currentPassword,
				newPassword: formData.newPassword
			});
			
			// Show success message
			toastStore.success('Password changed successfully');
			
			// Reset form
			formData = {
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			};
			
			// Emit success event
			dispatch('success');
			
		} catch (error) {
			console.error('Change password error:', error);
			generalError = error.message || 'Failed to change password. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium text-gray-900">
			Change Password
		</h3>
		<p class="mt-1 text-sm text-gray-600">
			Update your password to keep your account secure
		</p>
	</div>

	{#if generalError}
		<Alert type="error" dismissible on:dismiss={() => generalError = ''}>
			{generalError}
		</Alert>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<Input
			id="currentPassword"
			type="password"
			label="Current Password"
			placeholder="Enter your current password"
			bind:value={formData.currentPassword}
			error={errors.currentPassword}
			required
			autocomplete="current-password"
		/>

		<Input
			id="newPassword"
			type="password"
			label="New Password"
			placeholder="Enter your new password"
			bind:value={formData.newPassword}
			error={errors.newPassword}
			required
			autocomplete="new-password"
			hint="Password must be at least 6 characters long"
		/>

		<Input
			id="confirmPassword"
			type="password"
			label="Confirm New Password"
			placeholder="Confirm your new password"
			bind:value={formData.confirmPassword}
			error={errors.confirmPassword}
			required
			autocomplete="new-password"
		/>

		<div class="flex gap-3">
			<Button
				type="submit"
				variant="primary"
				{loading}
				disabled={loading}
			>
				{loading ? 'Updating...' : 'Update Password'}
			</Button>
			
			<Button
				type="button"
				variant="outline"
				on:click={() => dispatch('cancel')}
				disabled={loading}
			>
				Cancel
			</Button>
		</div>
	</form>
</div>