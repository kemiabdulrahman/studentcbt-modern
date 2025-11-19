import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load detailed student result
 */
export async function load({ locals, cookies, params }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'STUDENT') {
		redirect(303, '/auth/login');
	}

	try {
		const token = getAuthToken(cookies);
		const data = await serverGet(
			`/student/results/${params.id}`,
			token
		);
		return {
			result: data,
			assessment: data.assessment,
			answers: data.answers || [],
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Load result error:', error);
		return {
			result: null,
			assessment: null,
			answers: [],
			error: error.message || 'Failed to load result details',
			user: locals.auth.user
		};
	}
}
