/**
 * Central API exports
 * Combines all API modules into a single interface
 */

import { authApi } from './auth.js';
import { adminApi } from './admin.js';
import { assessmentsApi } from './assessments.js';
import { studentApi } from './student.js';
import { uploadApi } from './upload.js';

/**
 * Unified API object matching the original structure
 * @example
 * import api from '$lib/api';
 * const user = await api.auth.login(credentials);
 * const students = await api.admin.students.getAll();
 * const assessments = await api.assessments.getAll();
 * const results = await api.student.getResults();
 * await api.upload.uploadStudents(classId, file);
 */
export const api = {
	auth: authApi,
	admin: adminApi,
	assessments: assessmentsApi,
	student: studentApi,
	upload: uploadApi
};

// Also export individual modules for tree-shaking if needed
export * from './auth.js';
export * from './admin.js';
export * from './assessments.js';
export * from './student.js';
export * from './upload.js';
export * from './core.js';

export default api;
