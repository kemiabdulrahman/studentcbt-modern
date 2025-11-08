import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import Cookies from 'js-cookie';

/**
 * @typedef {import('$types').User} User
 * @typedef {import('$types').AuthTokens} AuthTokens
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated
 * @property {User | null} user
 * @property {AuthTokens | null} tokens
 * @property {boolean} isLoading
 */

// Default auth state
const defaultAuthState = {
	isAuthenticated: false,
	user: null,
	tokens: null,
	isLoading: true
};

// Create writable store
function createAuthStore() {
	const { subscribe, set, update } = writable(defaultAuthState);

	// Initialize from cookies on browser load
	if (browser) {
		const savedTokens = Cookies.get('auth_tokens');
		const savedUser = Cookies.get('auth_user');

		if (savedTokens && savedUser) {
			try {
				const tokens = JSON.parse(savedTokens);
				const user = JSON.parse(savedUser);
				
				set({
					isAuthenticated: true,
					user,
					tokens,
					isLoading: false
				});
			} catch (error) {
				console.error('Error parsing saved auth data:', error);
				// Clear invalid data
				Cookies.remove('auth_tokens');
				Cookies.remove('auth_user');
				set({ ...defaultAuthState, isLoading: false });
			}
		} else {
			set({ ...defaultAuthState, isLoading: false });
		}
	}

	return {
		subscribe,
		
		/**
		 * Login user and save to cookies
		 * @param {User} user 
		 * @param {AuthTokens} tokens 
		 */
		login(user, tokens) {
			const authData = {
				isAuthenticated: true,
				user,
				tokens,
				isLoading: false
			};
			
			set(authData);
			
			if (browser) {
				// Save to cookies with 7 day expiry
				Cookies.set('auth_tokens', JSON.stringify(tokens), { 
					expires: 7, 
					secure: true, 
					sameSite: 'strict' 
				});
				Cookies.set('auth_user', JSON.stringify(user), { 
					expires: 7, 
					secure: true, 
					sameSite: 'strict' 
				});
			}
		},

		/**
		 * Update auth tokens
		 * @param {AuthTokens} tokens 
		 */
		updateTokens(tokens) {
			update(state => {
				const newState = { ...state, tokens };
				
				if (browser) {
					Cookies.set('auth_tokens', JSON.stringify(tokens), { 
						expires: 7, 
						secure: true, 
						sameSite: 'strict' 
					});
				}
				
				return newState;
			});
		},

		/**
		 * Update user data
		 * @param {User} user 
		 */
		updateUser(user) {
			update(state => {
				const newState = { ...state, user };
				
				if (browser) {
					Cookies.set('auth_user', JSON.stringify(user), { 
						expires: 7, 
						secure: true, 
						sameSite: 'strict' 
					});
				}
				
				return newState;
			});
		},

		/**
		 * Logout user and clear cookies
		 */
		logout() {
			set(defaultAuthState);
			
			if (browser) {
				Cookies.remove('auth_tokens');
				Cookies.remove('auth_user');
			}
		},

		/**
		 * Set loading state
		 * @param {boolean} isLoading 
		 */
		setLoading(isLoading) {
			update(state => ({ ...state, isLoading }));
		}
	};
}

export const authStore = createAuthStore();

// Derived stores for convenience
export const isAuthenticated = derived(authStore, $auth => $auth.isAuthenticated);
export const currentUser = derived(authStore, $auth => $auth.user);
export const userRole = derived(authStore, $auth => $auth.user?.role);
export const isAdmin = derived(authStore, $auth => $auth.user?.role === 'ADMIN');
export const isStudent = derived(authStore, $auth => $auth.user?.role === 'STUDENT');
export const authTokens = derived(authStore, $auth => $auth.tokens);
export const authLoading = derived(authStore, $auth => $auth.isLoading);