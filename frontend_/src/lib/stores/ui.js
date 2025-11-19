import { writable, derived } from 'svelte/store';


// Toast notifications
function createToastStore() {
	const { subscribe, update } = writable([]);

	let toastId = 0;

	return {
		subscribe,
		
		/**
		 * Add a toast notification
		 * @param {Omit<ToastMessage, 'id'>} toast 
		 */
		add(toast) {
			const id = `toast-${++toastId}`;
			const newToast = {
				id,
				duration: 5000,
				dismissible: true,
				...toast
			};

			update(toasts => [...toasts, newToast]);

			// Auto dismiss after duration
			if (newToast.duration > 0) {
				setTimeout(() => {
					this.dismiss(id);
				}, newToast.duration);
			}

			return id;
		},

		/**
		 * Dismiss a toast by ID
		 * @param {string} id 
		 */
		dismiss(id) {
			update(toasts => toasts.filter(toast => toast.id !== id));
		},

		/**
		 * Clear all toasts
		 */
		clear() {
			update(() => []);
		},

		// Convenience methods
		success(message, options = {}) {
			return this.add({ type: 'success', message, ...options });
		},

		error(message, options = {}) {
			return this.add({ type: 'error', message, ...options });
		},

		warning(message, options = {}) {
			return this.add({ type: 'warning', message, ...options });
		},

		info(message, options = {}) {
			return this.add({ type: 'info', message, ...options });
		}
	};
}

export const toastStore = createToastStore();

// Modal management
function createModalStore() {
	const { subscribe, set, update } = writable([]);

	let modalId = 0;

	return {
		subscribe,

		/**
		 * Open a modal
		 * @param {Omit<Modal, 'id'>} modal 
		 */
		open(modal) {
			const id = `modal-${++modalId}`;
			const newModal = {
				id,
				closeable: true,
				...modal
			};

			update(modals => [...modals, newModal]);
			return id;
		},

		/**
		 * Close a modal by ID
		 * @param {string} id 
		 */
		close(id) {
			update(modals => modals.filter(modal => modal.id !== id));
		},

		/**
		 * Close all modals
		 */
		closeAll() {
			set([]);
		}
	};
}

export const modalStore = createModalStore();

// Loading states
function createLoadingStore() {
	const { subscribe, update } = writable({});

	return {
		subscribe,

		/**
		 * Set loading state for a specific key
		 * @param {string} key 
		 * @param {boolean} isLoading 
		 */
		set(key, isLoading) {
			update(state => ({
				...state,
				[key]: isLoading
			}));
		},

		/**
		 * Clear loading state for a key
		 * @param {string} key 
		 */
		clear(key) {
			update(state => {
				const newState = { ...state };
				delete newState[key];
				return newState;
			});
		},

		/**
		 * Clear all loading states
		 */
		clearAll() {
			update(() => ({}));
		}
	};
}

export const loadingStore = createLoadingStore();

// Sidebar state (for responsive design)
export const sidebarOpen = writable(false);

// Theme preferences
export const theme = writable('light');

// Page title
export const pageTitle = writable('StudentCBT');

// Breadcrumbs
export const breadcrumbs = writable([]);

// Search state
export const searchQuery = writable('');

// Pagination state for lists
function createPaginationStore() {
	const { subscribe, set, update } = writable({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0
	});

	return {
		subscribe,

		/**
		 * Set pagination data
		 * @param {Object} pagination 
		 */
		setPagination(pagination) {
			set(pagination);
		},

		/**
		 * Set current page
		 * @param {number} page 
		 */
		setPage(page) {
			update(state => ({ ...state, page }));
		},

		/**
		 * Set page limit
		 * @param {number} limit 
		 */
		setLimit(limit) {
			update(state => ({ ...state, limit, page: 1 }));
		},

		/**
		 * Reset to first page
		 */
		reset() {
			update(state => ({ ...state, page: 1 }));
		}
	};
}

export const paginationStore = createPaginationStore();

// Form state management
function createFormStore() {
	const { subscribe, set, update } = writable({});

	return {
		subscribe,

		/**
		 * Set form data
		 * @param {string} formId 
		 * @param {any} data 
		 */
		setData(formId, data) {
			update(state => ({
				...state,
				[formId]: {
					...state[formId],
					data
				}
			}));
		},

		/**
		 * Set form errors
		 * @param {string} formId 
		 * @param {Object} errors 
		 */
		setErrors(formId, errors) {
			update(state => ({
				...state,
				[formId]: {
					...state[formId],
					errors
				}
			}));
		},

		/**
		 * Set form loading state
		 * @param {string} formId 
		 * @param {boolean} isLoading 
		 */
		setLoading(formId, isLoading) {
			update(state => ({
				...state,
				[formId]: {
					...state[formId],
					isLoading
				}
			}));
		},

		/**
		 * Clear form state
		 * @param {string} formId 
		 */
		clear(formId) {
			update(state => {
				const newState = { ...state };
				delete newState[formId];
				return newState;
			});
		}
	};
}

export const formStore = createFormStore();

// Derived stores
export const hasToasts = derived(toastStore, $toasts => $toasts.length > 0);
export const hasModals = derived(modalStore, $modals => $modals.length > 0);
export const isLoading = derived(loadingStore, $loading => 
	Object.values($loading).some(state => state === true)
);