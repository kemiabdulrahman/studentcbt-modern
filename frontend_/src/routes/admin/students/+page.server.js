import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load students list for admin
 */
export async function load({ locals, cookies, url }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'ADMIN') {
		redirect(303, '/auth/login');
	}

	const pageNum = url.searchParams.get('page') || 1;
	const limit = 10;

	try {
		const token = getAuthToken(cookies);
		const data = await serverGet(`/admin/students?page=${pageNum}&limit=${limit}`, token);
		return {
			students: data.students || [],
			pagination: data.pagination || { total: 0, page: pageNum, limit },
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Load students error:', error);
		return {
			students: [],
			pagination: { total: 0, page: pageNum, limit: 10 },
			error: error.message || 'Failed to load students',
			user: locals.auth.user
		};
	}
}
