import { apiFetch, parseResponse } from './core.js';

/**
 * Upload API endpoints
 */
export const uploadApi = {
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
};
