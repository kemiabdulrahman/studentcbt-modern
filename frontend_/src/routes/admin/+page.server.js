import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load dashboard counts server-side
 * This runs on the server and passes data to the page component
 */
export async function load({ locals, cookies }) {
	// Check if user is authenticated
	if (!locals.auth?.isAuthenticated) {
		redirect(303, '/auth/login');
	}

	// Check if user has admin role
	if (locals.auth.user?.role !== 'ADMIN') {
		redirect(303, '/unauthorized');
	}

	try {
		const token = getAuthToken(cookies);

		// Fetch all counts in parallel
		const [classesData, subjectsData, studentsData, assessmentsData] = await Promise.all([
			serverGet('/admin/classes', token),
			serverGet('/admin/subjects', token),
			serverGet('/admin/students?limit=1', token),
			serverGet('/assessments?limit=1', token)
		]);

		const counts = {
			classes: (classesData.classes || []).length,
			subjects: (subjectsData.subjects || []).length,
			students: studentsData.pagination?.total || (studentsData.students || []).length || 0,
			assessments: assessmentsData.pagination?.total || (assessmentsData.assessments || []).length || 0
		};

		return {
			counts,
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Dashboard load error:', error);
		return {
			counts: { classes: 0, subjects: 0, students: 0, assessments: 0 },
			error: 'Failed to load dashboard data',
			user: locals.auth.user
		};
	}
}
