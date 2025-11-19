import { apiFetch, parseResponse } from './core.js';

/**
 * Admin API endpoints
 */
export const adminApi = {
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

		/**
		 * Get all students
		 * @param {{page?: number, limit?: number, classId?: string, search?: string}} params 
		 * @returns {Promise<{students: import('$types').Student[], pagination: Object}>}
		 */
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

		/**
		 * Delete student
		 * @param {string} id 
		 * @returns {Promise<{message: string}>}
		 */
		async delete(id) {
			const response = await apiFetch(`/admin/students/${id}`, {
				method: 'DELETE'
			});
			return parseResponse(response);
		}
	},

	// Class management
	classes: {
		/**
		 * Create new class
		 * @param {{name: string, stream?: string}} classData 
		 * @returns {Promise<{class: import('$types').SchoolClass}>}
		 */
		async create(classData) {
			const response = await apiFetch('/admin/classes', {
				method: 'POST',
				body: JSON.stringify(classData)
			});
			return parseResponse(response);
		},

		/**
		 * Get all classes
		 * @returns {Promise<{classes: import('$types').SchoolClass[]}>}
		 */
		async getAll() {
			const response = await apiFetch('/admin/classes');
			return parseResponse(response);
		},

		/**
		 * Get subjects for a class
		 * @param {string} classId 
		 * @returns {Promise<{classSubjects: any[]}>}
		 */
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

		/**
		 * Get all subjects
		 * @returns {Promise<{subjects: import('$types').Subject[]}>}
		 */
		async getAll() {
			const response = await apiFetch('/admin/subjects');
			return parseResponse(response);
		},

		/**
		 * Assign subject to class
		 * @param {{classId: string, subjectId: string}} assignmentData 
		 * @returns {Promise<any>}
		 */
		async assignToClass(assignmentData) {
			const response = await apiFetch('/admin/class-subjects', {
				method: 'POST',
				body: JSON.stringify(assignmentData)
			});
			return parseResponse(response);
		}
	}
};
