import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load all assessments for admin
 */
export async function load({ locals, cookies }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'ADMIN') {
		redirect(303, '/auth/login');
	}

	try {
		const token = getAuthToken(cookies);
		const resp = await serverGet('/assessments?limit=50', token);
		if (!resp.ok) throw new Error('Failed to fetch assessments');

		const data = await resp.json();
		return {
			assessments: data.assessments || [],
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Load assessments error:', error);
		return {
			assessments: [],
			error: error.message || 'Failed to load assessments',
			user: locals.auth.user
		};
	}
}
