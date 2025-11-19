import { goto } from '$app/navigation';
import { authStore } from '$stores/auth';
import { get } from 'svelte/store';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Custom fetch wrapper with authentication and error handling
 * @param {string} url 
 * @param {RequestInit} options 
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options = {}) {
	const auth = get(authStore);
	
	const config = {
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		},
		...options
	};

	// Add authorization header if user is authenticated
	if (auth.isAuthenticated && auth.tokens?.accessToken) {
		config.headers.Authorization = `Bearer ${auth.tokens.accessToken}`;
	}

	try {
		const response = await fetch(`${API_BASE_URL}${url}`, config);

		// Handle 401 errors (token expiry)
		if (response.status === 401 && auth.isAuthenticated) {
			// Try to refresh token
			const refreshed = await refreshToken();
			if (refreshed) {
				// Retry the original request with new token
				config.headers.Authorization = `Bearer ${get(authStore).tokens?.accessToken}`;
				return fetch(`${API_BASE_URL}${url}`, config);
			} else {
				// Refresh failed, redirect to login
				authStore.logout();
				goto('/auth/login');
				throw new Error('Session expired. Please login again.');
			}
		}

		return response;
	} catch (error) {
		console.error('API request failed:', error);
		throw error;
	}
}

/**
 * Parse API response and handle errors
 * @param {Response} response 
 * @returns {Promise<any>}
 */
export async function parseResponse(response) {
	const contentType = response.headers.get('content-type');
	
	if (contentType && contentType.includes('application/json')) {
		const data = await response.json();
		
		if (!response.ok) {
			throw new Error(data.error || data.message || `HTTP ${response.status}`);
		}
		
		return data;
	} else {
		// Handle non-JSON responses (like file downloads)
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		
		return response;
	}
}

/**
 * Refresh authentication token
 * @returns {Promise<boolean>}
 */
export async function refreshToken() {
	try {
		const auth = get(authStore);
		if (!auth.tokens?.refreshToken) {
			return false;
		}

		const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				refreshToken: auth.tokens.refreshToken
			})
		});

		if (response.ok) {
			const data = await response.json();
			authStore.updateTokens(data.tokens);
			return true;
		}
		
		return false;
	} catch (error) {
		console.error('Token refresh failed:', error);
		return false;
	}
}
