import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load individual student attempt for review
 */
export async function load({ locals, cookies, params }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'ADMIN') {
		redirect(303, '/auth/login');
	}

	try {
		const token = getAuthToken(cookies);

		const data = await serverGet(
			`/assessments/${params.id}/attempts/${params.studentId}`,
			token
		);

		return {
			attempt: data.attempt || data,
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Load attempt error:', error);
		return {
			attempt: null,
			error: error.message || 'Failed to load attempt details',
			user: locals.auth.user
		};
	}
}
