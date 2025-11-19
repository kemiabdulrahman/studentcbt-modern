import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load single assessment for editing
 */
export async function load({ locals, cookies, params }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'ADMIN') {
		redirect(303, '/auth/login');
	}

	try {
		const token = getAuthToken(cookies);
		const resp = await serverGet(`/assessments/${params.id}`, token);
		if (!resp.ok) throw new Error('Failed to fetch assessment');

		const data = await resp.json();
		return {
			assessment: data.assessment || data,
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Load assessment error:', error);
		return {
			assessment: null,
			error: error.message || 'Failed to load assessment',
			user: locals.auth.user
		};
	}
}
