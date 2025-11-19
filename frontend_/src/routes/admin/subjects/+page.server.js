import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load all subjects for admin
 */
export async function load({ locals, cookies }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'ADMIN') {
		redirect(303, '/auth/login');
	}

	try {
		const token = getAuthToken(cookies);
		const resp = await serverGet('/admin/subjects', token);
		if (!resp.ok) throw new Error('Failed to fetch subjects');

		const data = await resp.json();
		return {
			subjects: data.subjects || [],
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Load subjects error:', error);
		return {
			subjects: [],
			error: error.message || 'Failed to load subjects',
			user: locals.auth.user
		};
	}
}
