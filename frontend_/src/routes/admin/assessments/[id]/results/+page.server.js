import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load assessment results for admin
 */
export async function load({ locals, cookies, params, url }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'ADMIN') {
		redirect(303, '/auth/login');
	}

	const pageNum = url.searchParams.get('page') || 1;
	const limit = 10;
	const assessmentId = params.id;

	try {
		const token = getAuthToken(cookies);

		const [assessmentData, resultsData] = await Promise.all([
			serverGet(`/assessments/${assessmentId}`, token),
			serverGet(`/assessments/${assessmentId}/results?page=${pageNum}&limit=${limit}`, token)
		]);

		return {
			assessment: assessmentData.assessment || assessmentData,
			results: resultsData.results || [],
			pagination: resultsData.pagination || { total: 0, page: pageNum, limit },
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Load results error:', error);
		return {
			assessment: null,
			results: [],
			pagination: { total: 0, page: pageNum, limit: 10 },
			error: error.message || 'Failed to load results',
			user: locals.auth.user
		};
	}
}
