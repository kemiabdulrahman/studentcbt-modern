import { apiFetch, parseResponse } from './core.js';

/**
 * Student API endpoints
 */
export const studentApi = {
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
};
