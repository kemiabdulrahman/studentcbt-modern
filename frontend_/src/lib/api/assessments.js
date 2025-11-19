import { apiFetch, parseResponse } from './core.js';

/**
 * Assessment API endpoints
 */
export const assessmentsApi = {
	/**
	 * Create new assessment
	 * @param {import('$types').CreateAssessmentData} assessmentData 
	 * @returns {Promise<{assessment: import('$types').Assessment}>}
	 */
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
};
