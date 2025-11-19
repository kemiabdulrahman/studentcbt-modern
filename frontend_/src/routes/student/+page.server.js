import { redirect } from '@sveltejs/kit';
import { serverGet, getAuthToken } from '$lib/utils/api.server';

/**
 * Load student dashboard data server-side
 */
export async function load({ locals, cookies }) {
	// Check if user is authenticated
	if (!locals.auth?.isAuthenticated) {
		redirect(303, '/auth/login');
	}

	// Check if user has student role
	if (locals.auth.user?.role !== 'STUDENT') {
		redirect(303, '/unauthorized');
	}

	try {
		const token = getAuthToken(cookies);

		// Fetch dashboard statistics for student
		const dashboardRes = await serverGet('/student/dashboard', token);

		if (!dashboardRes.ok) {
			throw new Error(`Failed to fetch dashboard: ${dashboardRes.status}`);
		}

		const data = await dashboardRes.json();

		return {
			statistics: data.statistics || {
				totalAssessments: 0,
				completedAssessments: 0,
				pendingAssessments: 0,
				averageScore: 0
			},
			recentAttempts: data.recentAttempts || [],
			user: locals.auth.user
		};
	} catch (error) {
		console.error('Dashboard load error:', error);
		return {
			statistics: {
				totalAssessments: 0,
				completedAssessments: 0,
				pendingAssessments: 0,
				averageScore: 0
			},
			recentAttempts: [],
			error: error.message || 'Failed to load dashboard data',
			user: locals.auth.user
		};
	}
}
