import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load classes and subjects for admin
 */
export async function load({ locals, cookies }) {
	if (!locals.auth?.isAuthenticated || locals.auth.user?.role !== 'ADMIN') {
		redirect(303, '/auth/login');
	}

	try {
		const token = getAuthToken(cookies);

		const [classesData, subjectsData] = await Promise.all([
			serverGet('/admin/classes', token),
			serverGet('/admin/subjects', token)
		]);

		return {
			classes: classesData || [],
			subjects: subjectsData || []
		};
	} catch (error) {
		console.error('Load error:', error);
		return {
			error: 'Failed to load classes and subjects',
			classes: [],
			subjects: []
		};
	}
}
