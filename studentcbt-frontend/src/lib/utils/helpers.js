import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Format date for display
 * @param {string | Date} date 
 * @param {string} formatStr 
 * @returns {string}
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
	if (!date) return '';
	
	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		return format(dateObj, formatStr);
	} catch (error) {
		console.error('Error formatting date:', error);
		return '';
	}
}

/**
 * Format date and time for display
 * @param {string | Date} date 
 * @returns {string}
 */
export function formatDateTime(date) {
	return formatDate(date, 'MMM dd, yyyy HH:mm');
}

/**
 * Format date relative to now (e.g., "2 hours ago")
 * @param {string | Date} date 
 * @returns {string}
 */
export function formatRelativeTime(date) {
	if (!date) return '';
	
	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		
		if (isToday(dateObj)) {
			return `Today at ${format(dateObj, 'HH:mm')}`;
		}
		
		if (isYesterday(dateObj)) {
			return `Yesterday at ${format(dateObj, 'HH:mm')}`;
		}
		
		return formatDistanceToNow(dateObj, { addSuffix: true });
	} catch (error) {
		console.error('Error formatting relative time:', error);
		return '';
	}
}

/**
 * Format time duration in seconds to human readable format
 * @param {number} seconds 
 * @returns {string}
 */
export function formatDuration(seconds) {
	if (!seconds || seconds < 0) return '0m';
	
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;
	
	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	
	if (minutes > 0) {
		return `${minutes}m ${remainingSeconds}s`;
	}
	
	return `${remainingSeconds}s`;
}

/**
 * Format time duration for timer display (MM:SS)
 * @param {number} seconds 
 * @returns {string}
 */
export function formatTimerDisplay(seconds) {
	if (!seconds || seconds < 0) return '00:00';
	
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	
	return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate percentage
 * @param {number} value 
 * @param {number} total 
 * @param {number} decimals 
 * @returns {number}
 */
export function calculatePercentage(value, total, decimals = 2) {
	if (!total || total === 0) return 0;
	return Number(((value / total) * 100).toFixed(decimals));
}

/**
 * Format percentage for display
 * @param {number} value 
 * @param {number} total 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatPercentage(value, total, decimals = 1) {
	return `${calculatePercentage(value, total, decimals)}%`;
}

/**
 * Get grade letter from percentage
 * @param {number} percentage 
 * @param {number} passMarks 
 * @returns {{grade: string, status: string, color: string}}
 */
export function getGrade(percentage, passMarks = 50) {
	if (percentage >= 90) {
		return { grade: 'A+', status: 'Excellent', color: 'green' };
	}
	if (percentage >= 80) {
		return { grade: 'A', status: 'Very Good', color: 'green' };
	}
	if (percentage >= 70) {
		return { grade: 'B+', status: 'Good', color: 'blue' };
	}
	if (percentage >= 60) {
		return { grade: 'B', status: 'Above Average', color: 'blue' };
	}
	if (percentage >= passMarks) {
		return { grade: 'C', status: 'Pass', color: 'yellow' };
	}
	return { grade: 'F', status: 'Fail', color: 'red' };
}

/**
 * Capitalize first letter of string
 * @param {string} str 
 * @returns {string}
 */
export function capitalize(str) {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 * @param {string} str 
 * @returns {string}
 */
export function titleCase(str) {
	if (!str) return '';
	return str.split(' ').map(capitalize).join(' ');
}

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} length 
 * @returns {string}
 */
export function truncate(text, length = 100) {
	if (!text || text.length <= length) return text;
	return text.substring(0, length) + '...';
}

/**
 * Generate random ID
 * @param {number} length 
 * @returns {string}
 */
export function generateId(length = 8) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Deep clone object
 * @param {any} obj 
 * @returns {any}
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') return obj;
	if (obj instanceof Date) return new Date(obj.getTime());
	if (obj instanceof Array) return obj.map(deepClone);
	if (typeof obj === 'object') {
		const cloned = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				cloned[key] = deepClone(obj[key]);
			}
		}
		return cloned;
	}
}

/**
 * Check if object is empty
 * @param {Object} obj 
 * @returns {boolean}
 */
export function isEmpty(obj) {
	if (obj == null) return true;
	if (Array.isArray(obj)) return obj.length === 0;
	if (typeof obj === 'object') return Object.keys(obj).length === 0;
	return false;
}

/**
 * Debounce function calls
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

/**
 * Throttle function calls
 * @param {Function} func 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(func, limit) {
	let inThrottle;
	return function executedFunction(...args) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

/**
 * Sort array by key
 * @param {Array} array 
 * @param {string} key 
 * @param {string} direction 
 * @returns {Array}
 */
export function sortBy(array, key, direction = 'asc') {
	return [...array].sort((a, b) => {
		const aVal = key.split('.').reduce((obj, k) => obj?.[k], a);
		const bVal = key.split('.').reduce((obj, k) => obj?.[k], b);
		
		if (aVal < bVal) return direction === 'asc' ? -1 : 1;
		if (aVal > bVal) return direction === 'asc' ? 1 : -1;
		return 0;
	});
}

/**
 * Filter array by search term
 * @param {Array} array 
 * @param {string} searchTerm 
 * @param {string[]} keys 
 * @returns {Array}
 */
export function filterBySearch(array, searchTerm, keys) {
	if (!searchTerm) return array;
	
	const term = searchTerm.toLowerCase();
	
	return array.filter(item => 
		keys.some(key => {
			const value = key.split('.').reduce((obj, k) => obj?.[k], item);
			return value?.toString().toLowerCase().includes(term);
		})
	);
}

/**
 * Group array by key
 * @param {Array} array 
 * @param {string} key 
 * @returns {Object}
 */
export function groupBy(array, key) {
	return array.reduce((groups, item) => {
		const group = key.split('.').reduce((obj, k) => obj?.[k], item);
		if (!groups[group]) groups[group] = [];
		groups[group].push(item);
		return groups;
	}, {});
}

/**
 * Calculate pagination info
 * @param {number} currentPage 
 * @param {number} totalItems 
 * @param {number} itemsPerPage 
 * @returns {Object}
 */
export function calculatePagination(currentPage, totalItems, itemsPerPage) {
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);
	
	return {
		currentPage,
		totalPages,
		totalItems,
		itemsPerPage,
		startItem,
		endItem,
		hasNext: currentPage < totalPages,
		hasPrev: currentPage > 1
	};
}

/**
 * Format file size
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatFileSize(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Download data as file
 * @param {string} data 
 * @param {string} filename 
 * @param {string} type 
 */
export function downloadFile(data, filename, type = 'text/plain') {
	const blob = new Blob([data], { type });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		return false;
	}
}

/**
 * Get question type display info
 * @param {string} type 
 * @returns {Object}
 */
export function getQuestionTypeInfo(type) {
	const types = {
		MULTIPLE_CHOICE: {
			label: 'Multiple Choice',
			icon: '◉',
			color: 'blue',
			description: 'Choose one from multiple options'
		},
		TRUE_FALSE: {
			label: 'True/False',
			icon: '✓',
			color: 'green',
			description: 'Select true or false'
		},
		FILL_BLANK: {
			label: 'Fill in the Blank',
			icon: '___',
			color: 'purple',
			description: 'Type your answer'
		}
	};
	
	return types[type] || {
		label: type,
		icon: '?',
		color: 'gray',
		description: 'Unknown question type'
	};
}

/**
 * Get status badge info
 * @param {string} status 
 * @param {string} type 
 * @returns {Object}
 */
export function getStatusBadge(status, type = 'assessment') {
	const badges = {
		assessment: {
			DRAFT: { label: 'Draft', color: 'gray' },
			PUBLISHED: { label: 'Published', color: 'green' },
			ARCHIVED: { label: 'Archived', color: 'red' }
		},
		attempt: {
			IN_PROGRESS: { label: 'In Progress', color: 'yellow' },
			SUBMITTED: { label: 'Submitted', color: 'green' },
			TIMED_OUT: { label: 'Timed Out', color: 'red' }
		}
	};
	
	return badges[type]?.[status] || { label: status, color: 'gray' };
}