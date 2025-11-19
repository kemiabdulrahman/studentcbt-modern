import { apiFetch, parseResponse } from './core.js';

/**
 * Authentication API endpoints
 */
export const authApi = {
	/**
	 * Login user
	 * @param {import('$types').LoginCredentials} credentials 
	 * @returns {Promise<{user: import('$types').User, tokens: import('$types').AuthTokens}>}
	 */
	async login(credentials) {
		const response = await apiFetch('/auth/login', {
			method: 'POST',
			body: JSON.stringify(credentials)
		});
		return parseResponse(response);
	},

	/**
	 * Get user profile
	 * @returns {Promise<{user: import('$types').User}>}
	 */
	async getProfile() {
		const response = await apiFetch('/auth/profile');
		return parseResponse(response);
	},

	/**
	 * Change password
	 * @param {{currentPassword: string, newPassword: string}} passwordData 
	 * @returns {Promise<{message: string}>}
	 */
	async changePassword(passwordData) {
		const response = await apiFetch('/auth/change-password', {
			method: 'POST',
			body: JSON.stringify(passwordData)
		});
		return parseResponse(response);
	}
};
