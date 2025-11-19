import { goto } from '$app/navigation';
import { authStore } from '$stores/auth';
import { get } from 'svelte/store';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Token refresh lock to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

async function apiFetch(url, options = {}) {
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
			// Prevent multiple refresh attempts simultaneously
			if (isRefreshing) {
				await refreshPromise;
				config.headers.Authorization = `Bearer ${get(authStore).tokens?.accessToken}`;
				return fetch(`${API_BASE_URL}${url}`, config);
			}

			isRefreshing = true;
			refreshPromise = refreshToken();
			const refreshed = await refreshPromise;
			isRefreshing = false;
			refreshPromise = null;

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
		isRefreshing = false;
		refreshPromise = null;
		throw error;
	}
}


async function parseResponse(response) {
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


async function refreshToken() {
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

// API methods
export const api = {
	// Authentication
	auth: {
		async login(credentials) {
			const response = await apiFetch('/auth/login', {
				method: 'POST',
				body: JSON.stringify(credentials)
			});
			return parseResponse(response);
		},

		async getProfile() {
			const response = await apiFetch('/auth/profile');
			return parseResponse(response);
		},

		async changePassword(passwordData) {
			const response = await apiFetch('/auth/change-password', {
				method: 'POST',
				body: JSON.stringify(passwordData)
			});
			return parseResponse(response);
		}
	},

	// Admin endpoints
	admin: {
		// Student management
		students: {
			/**
			 * Create new student
			 * @param {import('$types').CreateStudentData} studentData 
			 * @returns {Promise<{student: import('$types').Student}>}
			 */
			async create(studentData) {
				const response = await apiFetch('/admin/students', {
					method: 'POST',
					body: JSON.stringify(studentData)
				});
				return parseResponse(response);
			},

			async getAll(params = {}) {
				const searchParams = new URLSearchParams();
				Object.entries(params).forEach(([key, value]) => {
					if (value !== undefined && value !== '') {
						searchParams.append(key, value.toString());
					}
				});
				
				const response = await apiFetch(`/admin/students?${searchParams}`);
				return parseResponse(response);
			},

			/**
			 * Update student
			 * @param {string} id 
			 * @param {Partial<import('$types').Student>} updateData 
			 * @returns {Promise<{student: import('$types').Student}>}
			 */
			async update(id, updateData) {
				const response = await apiFetch(`/admin/students/${id}`, {
					method: 'PUT',
					body: JSON.stringify(updateData)
				});
				return parseResponse(response);
			},

			
			async delete(id) {
				const response = await apiFetch(`/admin/students/${id}`, {
					method: 'DELETE'
				});
				return parseResponse(response);
			}
		},

		// Class management
		classes: {
			
			async create(classData) {
				const response = await apiFetch('/admin/classes', {
					method: 'POST',
					body: JSON.stringify(classData)
				});
				return parseResponse(response);
			},

			
			async getAll() {
				const response = await apiFetch('/admin/classes');
				return parseResponse(response);
			},

			
			async getSubjects(classId) {
				const response = await apiFetch(`/admin/classes/${classId}/subjects`);
				return parseResponse(response);
			}
		},

		// Subject management
		subjects: {
			/**
			 * Create new subject
			 * @param {{name: string}} subjectData 
			 * @returns {Promise<{subject: import('$types').Subject}>}
			 */
			async create(subjectData) {
				const response = await apiFetch('/admin/subjects', {
					method: 'POST',
					body: JSON.stringify(subjectData)
				});
				return parseResponse(response);
			},

			
			async getAll() {
				const response = await apiFetch('/admin/subjects');
				return parseResponse(response);
			},

			
			async assignToClass(assignmentData) {
				const response = await apiFetch('/admin/class-subjects', {
					method: 'POST',
					body: JSON.stringify(assignmentData)
				});
				return parseResponse(response);
			}
		}
	},

	// Assessment endpoints
	assessments: {
		
		async create(assessmentData) {
			const response = await apiFetch('/assessment', {
				method: 'POST',
				body: JSON.stringify(assessmentData)
			});
			return parseResponse(response);
		},

		/**
		 * Get all assessments
		 * @param {{page?: number, limit?: number, status?: string, classId?: string, subjectId?: string}} params 
		 * @returns {Promise<{assessments: import('$types').Assessment[], pagination: Object}>}
		 */
		async getAll(params = {}) {
			const searchParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== '') {
					searchParams.append(key, value.toString());
				}
			});
			
			const response = await apiFetch(`/assessment?${searchParams}`);
			return parseResponse(response);
		},

		/**
		 * Get assessment by ID
		 * @param {string} id 
		 * @returns {Promise<{assessment: import('$types').Assessment}>}
		 */
		async getById(id) {
			const response = await apiFetch(`/assessment/${id}`);
			return parseResponse(response);
		},

		/**
		 * Update assessment
		 * @param {string} id 
		 * @param {Partial<import('$types').Assessment>} updateData 
		 * @returns {Promise<{assessment: import('$types').Assessment}>}
		 */
		async update(id, updateData) {
			const response = await apiFetch(`/assessment/${id}`, {
				method: 'PUT',
				body: JSON.stringify(updateData)
			});
			return parseResponse(response);
		},

		/**
		 * Delete assessment
		 * @param {string} id 
		 * @returns {Promise<{message: string}>}
		 */
		async delete(id) {
			const response = await apiFetch(`/assessment/${id}`, {
				method: 'DELETE'
			});
			return parseResponse(response);
		},

		/**
		 * Publish assessment
		 * @param {string} id 
		 * @returns {Promise<{assessment: import('$types').Assessment}>}
		 */
		async publish(id) {
			const response = await apiFetch(`/assessment/${id}/publish`, {
				method: 'POST'
			});
			return parseResponse(response);
		},

		/**
		 * Toggle result visibility
		 * @param {string} id 
		 * @param {boolean} showResults 
		 * @returns {Promise<any>}
		 */
		async toggleResults(id, showResults) {
			const response = await apiFetch(`/assessment/${id}/toggle-results`, {
				method: 'POST',
				body: JSON.stringify({ showResults })
			});
			return parseResponse(response);
		},

		/**
		 * Get assessment results
		 * @param {string} id 
		 * @param {{page?: number, limit?: number}} params 
		 * @returns {Promise<any>}
		 */
		async getResults(id, params = {}) {
			const searchParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
			
			const response = await apiFetch(`/assessment/${id}/results?${searchParams}`);
			return parseResponse(response);
		},

		/**
		 * Get assessment analytics
		 * @param {string} id 
		 * @returns {Promise<any>}
		 */
		async getAnalytics(id) {
			const response = await apiFetch(`/assessment/${id}/analytics`);
			return parseResponse(response);
		},

		/**
		 * Get student attempt details (Admin view)
		 * @param {string} assessmentId 
		 * @param {string} studentId 
		 * @returns {Promise<any>}
		 */
		async getStudentAttemptDetails(assessmentId, studentId) {
			const response = await apiFetch(`/assessment/${assessmentId}/students/${studentId}/attempt`);
			return parseResponse(response);
		},

		// Questions
		questions: {
			/**
			 * Add question to assessment
			 * @param {string} assessmentId 
			 * @param {import('$types').CreateQuestionData} questionData 
			 * @returns {Promise<{question: import('$types').Question}>}
			 */
			async add(assessmentId, questionData) {
				const response = await apiFetch(`/assessment/${assessmentId}/questions`, {
					method: 'POST',
					body: JSON.stringify(questionData)
				});
				return parseResponse(response);
			},

			/**
			 * Add multiple questions to assessment
			 * @param {string} assessmentId 
			 * @param {import('$types').CreateQuestionData[]} questions 
			 * @returns {Promise<{questions: import('$types').Question[]}>}
			 */
			async addBulk(assessmentId, questions) {
				const response = await apiFetch(`/assessment/${assessmentId}/questions/bulk`, {
					method: 'POST',
					body: JSON.stringify({ questions })
				});
				return parseResponse(response);
			},

			/**
			 * Update question
			 * @param {string} id 
			 * @param {Partial<import('$types').Question>} updateData 
			 * @returns {Promise<{question: import('$types').Question}>}
			 */
			async update(id, updateData) {
				const response = await apiFetch(`/assessment/questions/${id}`, {
					method: 'PUT',
					body: JSON.stringify(updateData)
				});
				return parseResponse(response);
			},

			/**
			 * Delete question
			 * @param {string} id 
			 * @returns {Promise<{message: string}>}
			 */
			async delete(id) {
				const response = await apiFetch(`/assessment/questions/${id}`, {
					method: 'DELETE'
				});
				return parseResponse(response);
			}
		}
	},

	// Student endpoints
	student: {
		/**
		 * Get student dashboard
		 * @returns {Promise<any>}
		 */
		async getDashboard() {
			const response = await apiFetch('/student/dashboard');
			return parseResponse(response);
		},

		/**
		 * Get available assessments
		 * @returns {Promise<{assessments: import('$types').Assessment[]}>}
		 */
		async getAvailableAssessments() {
			const response = await apiFetch('/student/assessments');
			return parseResponse(response);
		},

		/**
		 * Get assessment for exam
		 * @param {string} id 
		 * @returns {Promise<{assessment: import('$types').Assessment}>}
		 */
		async getAssessmentForExam(id) {
			const response = await apiFetch(`/student/assessments/${id}`);
			return parseResponse(response);
		},

		/**
		 * Start assessment
		 * @param {string} id 
		 * @returns {Promise<{attempt: import('$types').Attempt}>}
		 */
		async startAssessment(id) {
			const response = await apiFetch(`/student/assessments/${id}/start`, {
				method: 'POST'
			});
			return parseResponse(response);
		},

		/**
		 * Submit answer
		 * @param {string} assessmentId 
		 * @param {{questionId: string, answer: string}} answerData 
		 * @returns {Promise<{answer: import('$types').Answer}>}
		 */
		async submitAnswer(assessmentId, answerData) {
			const response = await apiFetch(`/student/assessments/${assessmentId}/answer`, {
				method: 'POST',
				body: JSON.stringify(answerData)
			});
			return parseResponse(response);
		},

		/**
		 * Get attempt status
		 * @param {string} assessmentId 
		 * @returns {Promise<any>}
		 */
		async getAttemptStatus(assessmentId) {
			const response = await apiFetch(`/student/assessments/${assessmentId}/status`);
			return parseResponse(response);
		},

		/**
		 * Submit assessment
		 * @param {string} assessmentId 
		 * @returns {Promise<any>}
		 */
		async submitAssessment(assessmentId) {
			const response = await apiFetch(`/student/assessments/${assessmentId}/submit`, {
				method: 'POST'
			});
			return parseResponse(response);
		},

		/**
		 * Get student results
		 * @param {{page?: number, limit?: number}} params 
		 * @returns {Promise<any>}
		 */
		async getResults(params = {}) {
			const searchParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, value.toString());
				}
			});
			
			const response = await apiFetch(`/student/results?${searchParams}`);
			return parseResponse(response);
		},

		/**
		 * Get detailed result
		 * @param {string} assessmentId 
		 * @returns {Promise<any>}
		 */
		async getDetailedResult(assessmentId) {
			const response = await apiFetch(`/student/results/${assessmentId}`);
			return parseResponse(response);
		}
	},

	// Upload endpoints
	upload: {
		/**
		 * Upload students file
		 * @param {string} classId 
		 * @param {File} file 
		 * @returns {Promise<any>}
		 */
		async uploadStudents(classId, file) {
			const formData = new FormData();
			formData.append('file', file);

			const response = await apiFetch(`/upload/students/${classId}`, {
				method: 'POST',
				headers: {}, // Remove Content-Type to let browser set it with boundary
				body: formData
			});
			return parseResponse(response);
		},

		/**
		 * Validate students file
		 * @param {File} file 
		 * @returns {Promise<any>}
		 */
		async validateStudents(file) {
			const formData = new FormData();
			formData.append('file', file);

			const response = await apiFetch('/upload/students/validate', {
				method: 'POST',
				headers: {}, // Remove Content-Type to let browser set it with boundary
				body: formData
			});
			return parseResponse(response);
		},

		/**
		 * Upload questions file
		 * @param {string} assessmentId 
		 * @param {File} file 
		 * @returns {Promise<any>}
		 */
		async uploadQuestions(assessmentId, file) {
			const formData = new FormData();
			formData.append('file', file);

			const response = await apiFetch(`/upload/questions/${assessmentId}`, {
				method: 'POST',
				headers: {}, // Remove Content-Type to let browser set it with boundary
				body: formData
			});
			return parseResponse(response);
		},

		/**
		 * Download file
		 * @param {string} url 
		 * @param {string} filename 
		 */
		async downloadFile(url, filename) {
			const response = await apiFetch(url);
			
			if (response.ok) {
				const blob = await response.blob();
				const downloadUrl = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = downloadUrl;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(downloadUrl);
			} else {
				throw new Error('Failed to download file');
			}
		}
	}
};

export default api;