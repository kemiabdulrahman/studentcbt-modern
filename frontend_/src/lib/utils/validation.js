import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters')
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Current password is required'),
	newPassword: z.string().min(6, 'Password must be at least 6 characters'),
	confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"]
});

// Student validation schemas
export const createStudentSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	studentId: z.string().min(3, 'Student ID must be at least 3 characters'),
	firstName: z.string().min(2, 'First name must be at least 2 characters'),
	lastName: z.string().min(2, 'Last name must be at least 2 characters'),
	classId: z.string().min(1, 'Please select a class')
});

export const updateStudentSchema = createStudentSchema.partial().omit({
	email: true,
	password: true,
	studentId: true
});

// Assessment validation schemas
export const createAssessmentSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters'),
	description: z.string().optional(),
	subjectId: z.string().min(1, 'Please select a subject'),
	classId: z.string().min(1, 'Please select a class'),
	duration: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours'),
	passMarks: z.number().min(0, 'Pass marks cannot be negative'),
	startTime: z.string().optional().nullable(),
	endTime: z.string().optional().nullable(),
	instructions: z.string().optional(),
	showResults: z.boolean().default(false)
}).refine(data => {
	if (data.startTime && data.endTime) {
		return new Date(data.startTime) < new Date(data.endTime);
	}
	return true;
}, {
	message: "End time must be after start time",
	path: ["endTime"]
});

// Question validation schemas
export const createQuestionSchema = z.object({
	questionText: z.string().min(10, 'Question text must be at least 10 characters'),
	questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK']),
	options: z.array(z.string()).optional(),
	correctAnswer: z.string().min(1, 'Correct answer is required'),
	marks: z.number().min(1, 'Marks must be at least 1').default(1),
	explanation: z.string().optional(),
	orderIndex: z.number().min(1, 'Order index must be at least 1')
}).refine(data => {
	if (data.questionType === 'MULTIPLE_CHOICE') {
		return data.options && data.options.length >= 2;
	}
	return true;
}, {
	message: "Multiple choice questions must have at least 2 options",
	path: ["options"]
}).refine(data => {
	if (data.questionType === 'TRUE_FALSE') {
		const answer = data.correctAnswer.toLowerCase();
		return ['true', 'false', 't', 'f'].includes(answer);
	}
	return true;
}, {
	message: "True/False questions must have 'true' or 'false' as correct answer",
	path: ["correctAnswer"]
});

// Class validation schemas
export const createClassSchema = z.object({
	name: z.string().min(2, 'Class name must be at least 2 characters'),
	stream: z.string().optional()
});

// Subject validation schemas
export const createSubjectSchema = z.object({
	name: z.string().min(2, 'Subject name must be at least 2 characters')
});

// Form validation helper
export function validateForm(schema, data) {
	try {
		const result = schema.parse(data);
		return { success: true, data: result, errors: {} };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = {};
			error.errors.forEach(err => {
				const path = err.path.join('.');
				errors[path] = err.message;
			});
			return { success: false, data: null, errors };
		}
		return { 
			success: false, 
			data: null, 
			errors: { _form: 'Validation failed' } 
		};
	}
}

// Field validation helper for real-time validation
export function validateField(schema, fieldName, value, formData = {}) {
	try {
		// Create a partial object with just this field
		const testData = { ...formData, [fieldName]: value };
		
		// Try to parse with the schema
		schema.parse(testData);
		return { isValid: true, error: null };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const fieldError = error.errors.find(err => 
				err.path.includes(fieldName)
			);
			return { 
				isValid: false, 
				error: fieldError ? fieldError.message : null 
			};
		}
		return { isValid: false, error: 'Validation failed' };
	}
}

// Common validation patterns
export const patterns = {
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	studentId: /^[A-Za-z0-9]{3,20}$/,
	phone: /^(\+234|0)[789][01]\d{8}$/,
	strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
};

// Custom validators
export const validators = {
	email: (value) => patterns.email.test(value),
	studentId: (value) => patterns.studentId.test(value),
	phone: (value) => patterns.phone.test(value),
	strongPassword: (value) => value.length >= 8 && patterns.strongPassword.test(value),
	
	// Date validators
	futureDate: (value) => new Date(value) > new Date(),
	pastDate: (value) => new Date(value) < new Date(),
	
	// File validators
	fileSize: (file, maxSizeInMB) => file.size <= maxSizeInMB * 1024 * 1024,
	fileType: (file, allowedTypes) => allowedTypes.includes(file.type),
	
	// Assessment specific
	timeRange: (startTime, endTime) => {
		if (!startTime || !endTime) return true;
		return new Date(startTime) < new Date(endTime);
	},
	
	passMarks: (passMarks, totalMarks) => passMarks <= totalMarks
};