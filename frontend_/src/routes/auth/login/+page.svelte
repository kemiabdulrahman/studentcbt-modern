<script>
	import { goto } from '$app/navigation';
	import LoginForm from '$components/auth/LoginForm.svelte';

	function handleLoginSuccess(event) {
		const user = event.detail;
		// Redirect based on role
		if (user.role === 'ADMIN') {
			goto('/admin');
		} else if (user.role === 'STUDENT') {
			goto('/student');
		} else {
			goto('/');
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-4">
	<div class="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
		<LoginForm on:success={handleLoginSuccess} />
	</div>
</div>

<style>
	/* Tailwind handles styling */
</style>
