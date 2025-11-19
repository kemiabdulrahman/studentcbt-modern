import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load student profile data
 */
export async function load({ locals, cookies }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'STUDENT') {
		redirect(303, '/auth/login');
	}

	try {
		const token = getAuthToken(cookies);
		const resp = await serverGet('/auth/profile', token);
		if (!resp.ok) throw new Error('Failed to fetch profile');

		const data = await resp.json();
		return {
			profile: data.user || data,
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Load profile error:', error);
		return {
			profile: null,
			error: error.message || 'Failed to load profile',
			user: locals.auth.user
		};
	}
}
