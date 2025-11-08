<script>
	import { createEventDispatcher } from 'svelte';
	import { authStore } from '$stores/auth';
	import { toastStore } from '$stores/ui';
	import { api } from '$utils/api';
	import { validateForm, loginSchema } from '$utils/validation';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';
	import Alert from '$components/ui/Alert.svelte';

	const dispatch = createEventDispatcher();

	let formData = {
		email: '',
		password: ''
	};
	
	let errors = {};
	let loading = false;
	let generalError = '';

	async function handleSubmit() {
		// Reset errors
		errors = {};
		generalError = '';

		// Validate form
		const validation = validateForm(loginSchema, formData);
		if (!validation.success) {
			errors = validation.errors;
			return;
		}

		loading = true;

		try {
			const response = await api.auth.login(formData);
			
			// Store auth data
			authStore.login(response.user, response.tokens);
			
			// Show success message
			toastStore.success('Welcome back!');
			
			// Emit success event
			dispatch('success', response.user);
			
		} catch (error) {
			console.error('Login error:', error);
			generalError = error.message || 'Login failed. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	}
</script>

<div class="space-y-6">
	<div class="text-center">
		<h2 class="text-3xl font-bold text-gray-900">
			Sign in to StudentCBT
		</h2>
		<p class="mt-2 text-sm text-gray-600">
			Enter your credentials to access your account
		</p>
	</div>

	{#if generalError}
		<Alert type="error" dismissible on:dismiss={() => generalError = ''}>
			{generalError}
		</Alert>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<Input
			id="email"
			type="email"
			label="Email Address"
			placeholder="Enter your email"
			bind:value={formData.email}
			error={errors.email}
			required
			autocomplete="email"
		/>

		<Input
			id="password"
			type="password"
			label="Password"
			placeholder="Enter your password"
			bind:value={formData.password}
			error={errors.password}
			required
			autocomplete="current-password"
			on:keydown={handleKeydown}
		/>

		<Button
			type="submit"
			variant="primary"
			size="lg"
			fullWidth
			{loading}
			disabled={loading}
		>
			{loading ? 'Signing in...' : 'Sign In'}
		</Button>
	</form>

	<div class="text-center">
		<p class="text-sm text-gray-600">
			Forgot your password? 
			<button 
				type="button"
				class="font-medium text-primary-600 hover:text-primary-500"
				on:click={() => dispatch('forgot-password')}
			>
				Reset it here
			</button>
		</p>
	</div>
</div>