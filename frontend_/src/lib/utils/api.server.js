/**
 * Server-side API utilities for +page.server.js files
 * Use this instead of direct fetch() calls to ensure consistent auth handling
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Make authenticated API call from server
 * @param {string} url - Relative URL (e.g., '/admin/students')
 * @param {Object} options - Fetch options
 * @param {string} authToken - JWT token from cookies
 * @returns {Promise<any>}
 */
export async function serverFetch(url, options = {}, authToken = null) {
	const config = {
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		},
		...options
	};

	// Add auth token if provided
	if (authToken) {
		config.headers.Authorization = `Bearer ${authToken}`;
	}

	try {
		const response = await fetch(`${API_BASE_URL}${url}`, config);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`API Error (${url}):`, error.message);
		throw error;
	}
}

/**
 * Extract auth token from cookies
 * @param {Object} cookies - SvelteKit cookies object
 * @returns {string|null}
 */
export function getAuthToken(cookies) {
	try {
		const authCookie = cookies.get('auth_tokens');
		if (!authCookie) return null;

		const tokens = JSON.parse(authCookie);
		return tokens.accessToken || null;
	} catch (error) {
		console.error('Failed to parse auth token:', error);
		return null;
	}
}

/**
 * Convenience method for GET requests
 * @param {string} url
 * @param {string} authToken
 * @returns {Promise<any>}
 */
export async function serverGet(url, authToken) {
	return serverFetch(url, { method: 'GET' }, authToken);
}

/**
 * Convenience method for POST requests
 * @param {string} url
 * @param {any} body
 * @param {string} authToken
 * @returns {Promise<any>}
 */
export async function serverPost(url, body, authToken) {
	return serverFetch(url, {
		method: 'POST',
		body: JSON.stringify(body)
	}, authToken);
}

/**
 * Convenience method for PUT requests
 * @param {string} url
 * @param {any} body
 * @param {string} authToken
 * @returns {Promise<any>}
 */
export async function serverPut(url, body, authToken) {
	return serverFetch(url, {
		method: 'PUT',
		body: JSON.stringify(body)
	}, authToken);
}

/**
 * Convenience method for DELETE requests
 * @param {string} url
 * @param {string} authToken
 * @returns {Promise<any>}
 */
export async function serverDelete(url, authToken) {
	return serverFetch(url, { method: 'DELETE' }, authToken);
}
