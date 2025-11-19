import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load student results
 */
export async function load({ locals, cookies, url }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'STUDENT') {
		redirect(303, '/auth/login');
	}

	const pageNum = url.searchParams.get('page') || 1;
	const limit = 10;

	try {
		const token = getAuthToken(cookies);
		const data = await serverGet(
			`/student/results?page=${pageNum}&limit=${limit}`,
			token
		);
		return {
			results: data.results || [],
			pagination: data.pagination || { total: 0, page: pageNum, limit },
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Load results error:', error);
		return {
			results: [],
			pagination: { total: 0, page: pageNum, limit: 10 },
			error: error.message || 'Failed to load results',
			user: locals.auth.user
		};
	}
}
