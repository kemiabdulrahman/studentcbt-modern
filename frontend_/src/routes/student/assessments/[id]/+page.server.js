import { redirect, fail } from '@sveltejs/kit';
import { serverGet, serverPost, getAuthToken } from '$lib/utils/api.server';

/**
 * Load assessment for student to preview before taking
 */
export async function load({ locals, cookies, params }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'STUDENT') {
		redirect(303, '/auth/login');
	}

	try {
		const token = getAuthToken(cookies);
		const assessment = await serverGet(`/student/assessments/${params.id}`, token);

		return {
			assessment,
			user: locals.auth.user,
			assessmentId: params.id
		};
	} catch (error) {
		return {
			assessment: null,
			error: error.message || 'Failed to load assessment',
			user: locals.auth.user
		};
	}
}

/**
 * Server action to start the assessment
 * This keeps the API call server-side and secure
 */
export const actions = {
	/**
	 * Start assessment action
	 * POST /student/assessments/:id/start
	 */
	async startAssessment({ request, locals, cookies, params }) {
		// Check authentication
		if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'STUDENT') {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const token = getAuthToken(cookies);
			const assessmentId = params.id;

			// Call API to start assessment
			const attempt = await serverPost(`/student/assessments/${assessmentId}/start`, {}, token);

			// Return success with attempt data
			return {
				success: true,
				attempt,
				assessmentId
			};
		} catch (error) {
			console.error('Failed to start assessment:', error);
			return fail(500, {
				error: error.message || 'Failed to start assessment'
			});
		}
	}
};
