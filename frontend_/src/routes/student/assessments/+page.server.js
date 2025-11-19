import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load available assessments for student
 */
export async function load({ locals, cookies }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'STUDENT') {
		redirect(303, '/auth/login');
	}

	try {
		const token = getAuthToken(cookies);
		const data = await serverGet('/student/assessments', token);

		return {
			assessments: data.assessments || [],
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Assessments load error:', error);
		return {
			assessments: [],
			error: error.message || 'Failed to load assessments',
			user: locals.auth.user
		};
	}
}
