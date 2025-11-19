import { writable, derived } from 'svelte/store';

/**
 * @typedef {import('$types').Assessment} Assessment
 * @typedef {import('$types').Question} Question
 * @typedef {import('$types').Attempt} Attempt
 * @typedef {import('$types').Answer} Answer
 */

// Current assessment being taken
function createCurrentAssessmentStore() {
	const { subscribe, set, update } = writable(null);

	return {
		subscribe,

		/**
		 * Set current assessment
		 * @param {Assessment} assessment 
		 */
		setAssessment(assessment) {
			set(assessment);
		},

		/**
		 * Clear current assessment
		 */
		clear() {
			set(null);
		}
	};
}

export const currentAssessment = createCurrentAssessmentStore();

// Current attempt state
function createCurrentAttemptStore() {
	const { subscribe, set, update } = writable(null);

	return {
		subscribe,

		/**
		 * Set current attempt
		 * @param {Attempt} attempt 
		 */
		setAttempt(attempt) {
			set(attempt);
		},

		/**
		 * Update attempt status
		 * @param {Partial<Attempt>} updates 
		 */
		updateAttempt(updates) {
			update(attempt => attempt ? { ...attempt, ...updates } : null);
		},

		/**
		 * Clear current attempt
		 */
		clear() {
			set(null);
		}
	};
}

export const currentAttempt = createCurrentAttemptStore();

// Exam timer
function createExamTimerStore() {
	const { subscribe, set, update } = writable({
		timeRemaining: 0,
		isActive: false,
		isPaused: false
	});

	let interval = null;

	return {
		subscribe,

		/**
		 * Start timer with given time in seconds
		 * @param {number} timeInSeconds 
		 */
		start(timeInSeconds) {
			set({
				timeRemaining: timeInSeconds,
				isActive: true,
				isPaused: false
			});

			this.resume();
		},

		/**
		 * Pause timer
		 */
		pause() {
			update(state => ({ ...state, isPaused: true }));
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		},

		/**
		 * Resume timer
		 */
		resume() {
			update(state => ({ ...state, isPaused: false }));
			
			if (interval) clearInterval(interval);
			
			interval = setInterval(() => {
				update(state => {
					if (state.timeRemaining <= 0) {
						this.stop();
						return { ...state, timeRemaining: 0, isActive: false };
					}
					return { ...state, timeRemaining: state.timeRemaining - 1 };
				});
			}, 1000);
		},

		/**
		 * Stop timer
		 */
		stop() {
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
			set({
				timeRemaining: 0,
				isActive: false,
				isPaused: false
			});
		},

		/**
		 * Update time remaining
		 * @param {number} timeInSeconds 
		 */
		updateTime(timeInSeconds) {
			update(state => ({ ...state, timeRemaining: timeInSeconds }));
		}
	};
}

export const examTimer = createExamTimerStore();

// Current answers for the exam
function createExamAnswersStore() {
	const { subscribe, set, update } = writable({});

	return {
		subscribe,

		/**
		 * Set answer for a question
		 * @param {string} questionId 
		 * @param {string} answer 
		 */
		setAnswer(questionId, answer) {
			update(answers => ({
				...answers,
				[questionId]: answer
			}));
		},

		/**
		 * Get answer for a question
		 * @param {string} questionId 
		 * @returns {string | undefined}
		 */
		getAnswer(questionId) {
			let answer;
			const unsubscribe = this.subscribe(answers => {
				answer = answers[questionId];
			});
			unsubscribe();
			return answer;
		},

		/**
		 * Remove answer for a question
		 * @param {string} questionId 
		 */
		removeAnswer(questionId) {
			update(answers => {
				const newAnswers = { ...answers };
				delete newAnswers[questionId];
				return newAnswers;
			});
		},

		/**
		 * Clear all answers
		 */
		clear() {
			set({});
		},

		/**
		 * Set multiple answers
		 * @param {Record<string, string>} answers 
		 */
		setAnswers(answers) {
			set(answers);
		}
	};
}

export const examAnswers = createExamAnswersStore();

// Question navigation
function createQuestionNavigationStore() {
	const { subscribe, set, update } = writable({
		currentQuestionIndex: 0,
		totalQuestions: 0,
		visitedQuestions: new Set(),
		answeredQuestions: new Set()
	});

	return {
		subscribe,

		/**
		 * Initialize navigation
		 * @param {number} totalQuestions 
		 */
		initialize(totalQuestions) {
			set({
				currentQuestionIndex: 0,
				totalQuestions,
				visitedQuestions: new Set([0]),
				answeredQuestions: new Set()
			});
		},

		/**
		 * Go to specific question
		 * @param {number} index 
		 */
		goToQuestion(index) {
			update(state => ({
				...state,
				currentQuestionIndex: index,
				visitedQuestions: new Set([...state.visitedQuestions, index])
			}));
		},

		/**
		 * Go to next question
		 */
		nextQuestion() {
			update(state => {
				const newIndex = Math.min(state.currentQuestionIndex + 1, state.totalQuestions - 1);
				return {
					...state,
					currentQuestionIndex: newIndex,
					visitedQuestions: new Set([...state.visitedQuestions, newIndex])
				};
			});
		},

		/**
		 * Go to previous question
		 */
		previousQuestion() {
			update(state => {
				const newIndex = Math.max(state.currentQuestionIndex - 1, 0);
				return {
					...state,
					currentQuestionIndex: newIndex,
					visitedQuestions: new Set([...state.visitedQuestions, newIndex])
				};
			});
		},

		/**
		 * Mark question as answered
		 * @param {number} index 
		 */
		markAnswered(index) {
			update(state => ({
				...state,
				answeredQuestions: new Set([...state.answeredQuestions, index])
			}));
		},

		/**
		 * Mark question as unanswered
		 * @param {number} index 
		 */
		markUnanswered(index) {
			update(state => {
				const newAnswered = new Set(state.answeredQuestions);
				newAnswered.delete(index);
				return {
					...state,
					answeredQuestions: newAnswered
				};
			});
		},

		/**
		 * Clear navigation state
		 */
		clear() {
			set({
				currentQuestionIndex: 0,
				totalQuestions: 0,
				visitedQuestions: new Set(),
				answeredQuestions: new Set()
			});
		}
	};
}

export const questionNavigation = createQuestionNavigationStore();

// Auto-save state
function createAutoSaveStore() {
	const { subscribe, set, update } = writable({
		isAutoSaving: false,
		lastSaved: null,
		saveError: null
	});

	return {
		subscribe,

		/**
		 * Set auto-saving state
		 * @param {boolean} isAutoSaving 
		 */
		setAutoSaving(isAutoSaving) {
			update(state => ({ ...state, isAutoSaving }));
		},

		/**
		 * Set last saved time
		 * @param {Date} timestamp 
		 */
		setSaved(timestamp = new Date()) {
			update(state => ({
				...state,
				isAutoSaving: false,
				lastSaved: timestamp,
				saveError: null
			}));
		},

		/**
		 * Set save error
		 * @param {string} error 
		 */
		setError(error) {
			update(state => ({
				...state,
				isAutoSaving: false,
				saveError: error
			}));
		},

		/**
		 * Clear error
		 */
		clearError() {
			update(state => ({ ...state, saveError: null }));
		}
	};
}

export const autoSave = createAutoSaveStore();

// Derived stores
export const currentQuestion = derived(
	[currentAssessment, questionNavigation],
	([$assessment, $nav]) => {
		if (!$assessment?.questions) return null;
		return $assessment.questions[$nav.currentQuestionIndex] || null;
	}
);

export const examProgress = derived(
	questionNavigation,
	($nav) => {
		const progress = ($nav.currentQuestionIndex + 1) / $nav.totalQuestions;
		return Math.round(progress * 100);
	}
);

export const answeredCount = derived(
	questionNavigation,
	($nav) => $nav.answeredQuestions.size
);

export const unansweredCount = derived(
	questionNavigation,
	($nav) => $nav.totalQuestions - $nav.answeredQuestions.size
);

export const timeRemainingFormatted = derived(
	examTimer,
	($timer) => {
		const minutes = Math.floor($timer.timeRemaining / 60);
		const seconds = $timer.timeRemaining % 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
);

export const timeWarning = derived(
	examTimer,
	($timer) => {
		if (!$timer.isActive) return null;
		const minutes = Math.floor($timer.timeRemaining / 60);
		
		if (minutes <= 5 && minutes > 2) return 'warning';
		if (minutes <= 2) return 'critical';
		return null;
	}
);