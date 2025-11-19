export async function load({ locals }) {
	// Return auth state that was populated by hooks.server.js
	// This is available to all pages via the `data` prop
	return {
		auth: locals.auth
	};
}
