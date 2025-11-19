import { json } from '@sveltejs/kit';

/**
 * Server-side hook to handle authentication initialization
 * Load auth data from cookies and make available to server-side code
 */
export async function handle({ event, resolve }) {
	// Extract auth tokens and user data from cookies
	const authTokensCookie = event.cookies.get('auth_tokens');
	const authUserCookie = event.cookies.get('auth_user');

	// Parse and attach to event.locals for access in +page.server.js
	if (authTokensCookie && authUserCookie) {
		try {
			const tokens = JSON.parse(authTokensCookie);
			const user = JSON.parse(authUserCookie);

			event.locals.auth = {
				isAuthenticated: true,
				user,
				tokens
			};
		} catch (error) {
			console.error('Failed to parse auth cookies:', error);
			event.locals.auth = {
				isAuthenticated: false,
				user: null,
				tokens: null
			};
		}
	} else {
		event.locals.auth = {
			isAuthenticated: false,
			user: null,
			tokens: null
		};
	}

	// Resolve the page
	const response = await resolve(event);

	return response;
}
