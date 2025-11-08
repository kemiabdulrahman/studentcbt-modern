import { writable, derived } from 'svelte/store';

/**
 * @typedef {import('$types').Student} Student
 * @typedef {import('$types').Assessment} Assessment
 * @typedef {import('$types').SchoolClass} SchoolClass
 * @typedef {import('$types').Subject} Subject
 */

// Students data
function createStudentsStore() {
	const { subscribe, set, update } = writable({
		items: [],
		loading: false,
		error: null,
		pagination: {
			page: 1,
			limit: 10,
			total: 0,
			pages: 0
		},
		filters: {
			search: '',
			classId: '',
			status: ''
		}
	});

	return {
		subscribe,

		/**
		 * Set students data
		 * @param {Student[]} students 
		 * @param {Object} pagination 
		 */
		setStudents(students, pagination = {}) {
			update(state => ({
				...state,
				items: students,
				pagination: { ...state.pagination, ...pagination },
				loading: false,
				error: null
			}));
		},

		/**
		 * Add new student
		 * @param {Student} student 
		 */
		addStudent(student) {
			update(state => ({
				...state,
				items: [student, ...state.items]
			}));
		},

		/**
		 * Update existing student
		 * @param {string} id 
		 * @param {Partial<Student>} updates 
		 */
		updateStudent(id, updates) {
			update(state => ({
				...state,
				items: state.items.map(student => 
					student.id === id ? { ...student, ...updates } : student
				)
			}));
		},

		/**
		 * Remove student
		 * @param {string} id 
		 */
		removeStudent(id) {
			update(state => ({
				...state,
				items: state.items.filter(student => student.id !== id)
			}));
		},

		/**
		 * Set loading state
		 * @param {boolean} loading 
		 */
		setLoading(loading) {
			update(state => ({ ...state, loading }));
		},

		/**
		 * Set error
		 * @param {string | null} error 
		 */
		setError(error) {
			update(state => ({ ...state, error, loading: false }));
		},

		/**
		 * Set filters
		 * @param {Object} filters 
		 */
		setFilters(filters) {
			update(state => ({
				...state,
				filters: { ...state.filters, ...filters },
				pagination: { ...state.pagination, page: 1 }
			}));
		},

		/**
		 * Set pagination
		 * @param {Object} pagination 
		 */
		setPagination(pagination) {
			update(state => ({
				...state,
				pagination: { ...state.pagination, ...pagination }
			}));
		},

		/**
		 * Clear all data
		 */
		clear() {
			set({
				items: [],
				loading: false,
				error: null,
				pagination: {
					page: 1,
					limit: 10,
					total: 0,
					pages: 0
				},
				filters: {
					search: '',
					classId: '',
					status: ''
				}
			});
		}
	};
}

export const studentsStore = createStudentsStore();

// Assessments data
function createAssessmentsStore() {
	const { subscribe, set, update } = writable({
		items: [],
		loading: false,
		error: null,
		pagination: {
			page: 1,
			limit: 10,
			total: 0,
			pages: 0
		},
		filters: {
			search: '',
			status: '',
			classId: '',
			subjectId: ''
		}
	});

	return {
		subscribe,

		/**
		 * Set assessments data
		 * @param {Assessment[]} assessments 
		 * @param {Object} pagination 
		 */
		setAssessments(assessments, pagination = {}) {
			update(state => ({
				...state,
				items: assessments,
				pagination: { ...state.pagination, ...pagination },
				loading: false,
				error: null
			}));
		},

		/**
		 * Add new assessment
		 * @param {Assessment} assessment 
		 */
		addAssessment(assessment) {
			update(state => ({
				...state,
				items: [assessment, ...state.items]
			}));
		},

		/**
		 * Update existing assessment
		 * @param {string} id 
		 * @param {Partial<Assessment>} updates 
		 */
		updateAssessment(id, updates) {
			update(state => ({
				...state,
				items: state.items.map(assessment => 
					assessment.id === id ? { ...assessment, ...updates } : assessment
				)
			}));
		},

		/**
		 * Remove assessment
		 * @param {string} id 
		 */
		removeAssessment(id) {
			update(state => ({
				...state,
				items: state.items.filter(assessment => assessment.id !== id)
			}));
		},

		/**
		 * Set loading state
		 * @param {boolean} loading 
		 */
		setLoading(loading) {
			update(state => ({ ...state, loading }));
		},

		/**
		 * Set error
		 * @param {string | null} error 
		 */
		setError(error) {
			update(state => ({ ...state, error, loading: false }));
		},

		/**
		 * Set filters
		 * @param {Object} filters 
		 */
		setFilters(filters) {
			update(state => ({
				...state,
				filters: { ...state.filters, ...filters },
				pagination: { ...state.pagination, page: 1 }
			}));
		},

		/**
		 * Set pagination
		 * @param {Object} pagination 
		 */
		setPagination(pagination) {
			update(state => ({
				...state,
				pagination: { ...state.pagination, ...pagination }
			}));
		},

		/**
		 * Clear all data
		 */
		clear() {
			set({
				items: [],
				loading: false,
				error: null,
				pagination: {
					page: 1,
					limit: 10,
					total: 0,
					pages: 0
				},
				filters: {
					search: '',
					status: '',
					classId: '',
					subjectId: ''
				}
			});
		}
	};
}

export const assessmentsStore = createAssessmentsStore();

// Classes data
function createClassesStore() {
	const { subscribe, set, update } = writable({
		items: [],
		loading: false,
		error: null
	});

	return {
		subscribe,

		/**
		 * Set classes data
		 * @param {SchoolClass[]} classes 
		 */
		setClasses(classes) {
			update(state => ({
				...state,
				items: classes,
				loading: false,
				error: null
			}));
		},

		/**
		 * Add new class
		 * @param {SchoolClass} schoolClass 
		 */
		addClass(schoolClass) {
			update(state => ({
				...state,
				items: [...state.items, schoolClass]
			}));
		},

		/**
		 * Update existing class
		 * @param {string} id 
		 * @param {Partial<SchoolClass>} updates 
		 */
		updateClass(id, updates) {
			update(state => ({
				...state,
				items: state.items.map(cls => 
					cls.id === id ? { ...cls, ...updates } : cls
				)
			}));
		},

		/**
		 * Remove class
		 * @param {string} id 
		 */
		removeClass(id) {
			update(state => ({
				...state,
				items: state.items.filter(cls => cls.id !== id)
			}));
		},

		/**
		 * Set loading state
		 * @param {boolean} loading 
		 */
		setLoading(loading) {
			update(state => ({ ...state, loading }));
		},

		/**
		 * Set error
		 * @param {string | null} error 
		 */
		setError(error) {
			update(state => ({ ...state, error, loading: false }));
		},

		/**
		 * Clear all data
		 */
		clear() {
			set({
				items: [],
				loading: false,
				error: null
			});
		}
	};
}

export const classesStore = createClassesStore();

// Subjects data
function createSubjectsStore() {
	const { subscribe, set, update } = writable({
		items: [],
		loading: false,
		error: null
	});

	return {
		subscribe,

		/**
		 * Set subjects data
		 * @param {Subject[]} subjects 
		 */
		setSubjects(subjects) {
			update(state => ({
				...state,
				items: subjects,
				loading: false,
				error: null
			}));
		},

		/**
		 * Add new subject
		 * @param {Subject} subject 
		 */
		addSubject(subject) {
			update(state => ({
				...state,
				items: [...state.items, subject]
			}));
		},

		/**
		 * Update existing subject
		 * @param {string} id 
		 * @param {Partial<Subject>} updates 
		 */
		updateSubject(id, updates) {
			update(state => ({
				...state,
				items: state.items.map(subject => 
					subject.id === id ? { ...subject, ...updates } : subject
				)
			}));
		},

		/**
		 * Remove subject
		 * @param {string} id 
		 */
		removeSubject(id) {
			update(state => ({
				...state,
				items: state.items.filter(subject => subject.id !== id)
			}));
		},

		/**
		 * Set loading state
		 * @param {boolean} loading 
		 */
		setLoading(loading) {
			update(state => ({ ...state, loading }));
		},

		/**
		 * Set error
		 * @param {string | null} error 
		 */
		setError(error) {
			update(state => ({ ...state, error, loading: false }));
		},

		/**
		 * Clear all data
		 */
		clear() {
			set({
				items: [],
				loading: false,
				error: null
			});
		}
	};
}

export const subjectsStore = createSubjectsStore();

// Derived stores for easy access
export const studentsList = derived(studentsStore, $store => $store.items);
export const studentsLoading = derived(studentsStore, $store => $store.loading);
export const studentsError = derived(studentsStore, $store => $store.error);

export const assessmentsList = derived(assessmentsStore, $store => $store.items);
export const assessmentsLoading = derived(assessmentsStore, $store => $store.loading);
export const assessmentsError = derived(assessmentsStore, $store => $store.error);

export const classesList = derived(classesStore, $store => $store.items);
export const classesLoading = derived(classesStore, $store => $store.loading);
export const classesError = derived(classesStore, $store => $store.error);

export const subjectsList = derived(subjectsStore, $store => $store.items);
export const subjectsLoading = derived(subjectsStore, $store => $store.loading);
export const subjectsError = derived(subjectsStore, $store => $store.error);

// Combined derived stores
export const classOptions = derived(classesList, $classes => 
	$classes.map(cls => ({
		value: cls.id,
		label: cls.stream ? `${cls.name} (${cls.stream})` : cls.name
	}))
);

export const subjectOptions = derived(subjectsList, $subjects => 
	$subjects.map(subject => ({
		value: subject.id,
		label: subject.name
	}))
);