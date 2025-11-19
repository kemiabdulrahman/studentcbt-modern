const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class FileProcessor {
  
  static validateStudentUploadFile(file) {
    const errors = [];
    
    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files only.');
      return { isValid: false, errors };
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size exceeds 5MB limit.');
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }
  
  static async parseStudentUploadFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('File is empty');
      }
      
      // Get headers (first row)
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);
      
      // Expected headers
      const expectedHeaders = ['studentid', 'firstname', 'lastname', 'email', 'password'];
      const normalizedHeaders = headers.map(h => String(h).toLowerCase().replace(/[^a-z]/g, ''));
      
      // Validate headers
      const missingHeaders = expectedHeaders.filter(header => 
        !normalizedHeaders.some(h => h.includes(header.replace(/[^a-z]/g, '')))
      );
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }
      
      // Map header indices
      const headerMap = {};
      expectedHeaders.forEach(expected => {
        const index = normalizedHeaders.findIndex(h => 
          h.includes(expected.replace(/[^a-z]/g, ''))
        );
        if (index !== -1) {
          headerMap[expected] = index;
        }
      });
      
      // Parse data rows
      const students = [];
      const errors = [];
      const duplicateIds = new Set();
      const duplicateEmails = new Set();
      const seenIds = new Set();
      const seenEmails = new Set();
      
      dataRows.forEach((row, index) => {
        const rowNumber = index + 2; // +2 because of 0-indexing and header row
        
        // Skip empty rows
        if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
          return;
        }
        
        const student = {
          studentId: row[headerMap.studentid] ? String(row[headerMap.studentid]).trim() : '',
          firstName: row[headerMap.firstname] ? String(row[headerMap.firstname]).trim() : '',
          lastName: row[headerMap.lastname] ? String(row[headerMap.lastname]).trim() : '',
          email: row[headerMap.email] ? String(row[headerMap.email]).trim().toLowerCase() : '',
          password: row[headerMap.password] ? String(row[headerMap.password]).trim() : ''
        };
        
        // Validate required fields
        const rowErrors = [];
        
        if (!student.studentId) {
          rowErrors.push('Student ID is required');
        }
        if (!student.firstName) {
          rowErrors.push('First Name is required');
        }
        if (!student.lastName) {
          rowErrors.push('Last Name is required');
        }
        if (!student.email) {
          rowErrors.push('Email is required');
        }
        if (!student.password) {
          rowErrors.push('Password is required');
        }
        
        // Validate email format
        if (student.email && !this.isValidEmail(student.email)) {
          rowErrors.push('Invalid email format');
        }
        
        // Validate password length
        if (student.password && student.password.length < 6) {
          rowErrors.push('Password must be at least 6 characters');
        }
        
        // Check for duplicates within file
        if (student.studentId) {
          if (seenIds.has(student.studentId)) {
            duplicateIds.add(student.studentId);
            rowErrors.push(`Duplicate Student ID: ${student.studentId}`);
          } else {
            seenIds.add(student.studentId);
          }
        }
        
        if (student.email) {
          if (seenEmails.has(student.email)) {
            duplicateEmails.add(student.email);
            rowErrors.push(`Duplicate Email: ${student.email}`);
          } else {
            seenEmails.add(student.email);
          }
        }
        
        if (rowErrors.length > 0) {
          errors.push({
            row: rowNumber,
            studentId: student.studentId || 'N/A',
            errors: rowErrors
          });
        } else {
          students.push(student);
        }
      });
      
      return {
        isValid: errors.length === 0,
        students,
        errors,
        summary: {
          totalRows: dataRows.length,
          validRows: students.length,
          errorRows: errors.length,
          duplicateIds: Array.from(duplicateIds),
          duplicateEmails: Array.from(duplicateEmails)
        }
      };
      
    } catch (error) {
      throw new Error(`Failed to parse file: ${error.message}`);
    }
  }
  
  static validateQuestionUploadFile(file) {
    const errors = [];
    
    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files only.');
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }
  
  static async parseQuestionUploadFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('File is empty');
      }
      
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);
      
      // Expected headers for questions
      const expectedHeaders = ['questiontext', 'questiontype', 'options', 'correctanswer', 'marks', 'explanation'];
      const normalizedHeaders = headers.map(h => String(h).toLowerCase().replace(/[^a-z]/g, ''));
      
      // Map header indices
      const headerMap = {};
      expectedHeaders.forEach(expected => {
        const index = normalizedHeaders.findIndex(h => 
          h.includes(expected.replace(/[^a-z]/g, ''))
        );
        if (index !== -1) {
          headerMap[expected] = index;
        }
      });
      
      // Check required headers
      const requiredHeaders = ['questiontext', 'questiontype', 'correctanswer'];
      const missingHeaders = requiredHeaders.filter(header => !(header in headerMap));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }
      
      const questions = [];
      const errors = [];
      
      dataRows.forEach((row, index) => {
        const rowNumber = index + 2;
        
        if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
          return;
        }
        
        const questionData = {
          questionText: row[headerMap.questiontext] ? String(row[headerMap.questiontext]).trim() : '',
          questionType: row[headerMap.questiontype] ? String(row[headerMap.questiontype]).trim().toUpperCase() : '',
          correctAnswer: row[headerMap.correctanswer] ? String(row[headerMap.correctanswer]).trim() : '',
          marks: row[headerMap.marks] ? parseInt(row[headerMap.marks]) : 1,
          explanation: row[headerMap.explanation] ? String(row[headerMap.explanation]).trim() : '',
          orderIndex: index + 1
        };
        
        // Parse options for multiple choice
        if (headerMap.options !== undefined && row[headerMap.options]) {
          const optionsText = String(row[headerMap.options]).trim();
          if (optionsText) {
            // Split by common delimiters
            questionData.options = optionsText.split(/[,;|\n]/)
              .map(opt => opt.trim())
              .filter(opt => opt.length > 0);
          }
        }
        
        // Validate question
        const rowErrors = this.validateQuestionData(questionData);
        
        if (rowErrors.length > 0) {
          errors.push({
            row: rowNumber,
            question: questionData.questionText || 'N/A',
            errors: rowErrors
          });
        } else {
          questions.push(questionData);
        }
      });
      
      return {
        isValid: errors.length === 0,
        questions,
        errors,
        summary: {
          totalRows: dataRows.length,
          validRows: questions.length,
          errorRows: errors.length
        }
      };
      
    } catch (error) {
      throw new Error(`Failed to parse questions file: ${error.message}`);
    }
  }
  
  static validateQuestionData(questionData) {
    const errors = [];
    
    // Required fields
    if (!questionData.questionText) {
      errors.push('Question text is required');
    }
    
    if (!questionData.questionType) {
      errors.push('Question type is required');
    }
    
    if (!questionData.correctAnswer) {
      errors.push('Correct answer is required');
    }
    
    // Validate question type
    const validTypes = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK'];
    if (questionData.questionType && !validTypes.includes(questionData.questionType)) {
      errors.push(`Invalid question type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    // Type-specific validation
    if (questionData.questionType === 'MULTIPLE_CHOICE') {
      if (!questionData.options || questionData.options.length < 2) {
        errors.push('Multiple choice questions must have at least 2 options');
      }
    }
    
    if (questionData.questionType === 'TRUE_FALSE') {
      const validTFAnswers = ['true', 'false', 't', 'f'];
      if (questionData.correctAnswer && 
          !validTFAnswers.includes(questionData.correctAnswer.toLowerCase())) {
        errors.push('True/False questions must have "true" or "false" as correct answer');
      }
    }
    
    // Validate marks
    if (questionData.marks !== undefined && (isNaN(questionData.marks) || questionData.marks < 1)) {
      errors.push('Marks must be a positive number');
    }
    
    return errors;
  }
  
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
  
  static generateSampleStudentFile() {
    const sampleData = [
      ['Student ID*', 'First Name*', 'Last Name*', 'Email*', 'Password*'],
      ['STU001', 'John', 'Doe', 'john.doe@email.com', 'password123'],
      ['STU002', 'Jane', 'Smith', 'jane.smith@email.com', 'password456'],
      ['STU003', 'Mike', 'Johnson', 'mike.johnson@email.com', 'password789']
    ];
    
    return sampleData;
  }
  
  static generateSampleQuestionFile() {
    const sampleData = [
      ['Question Text*', 'Question Type*', 'Options', 'Correct Answer*', 'Marks', 'Explanation'],
      [
        'What is the capital of Nigeria?',
        'MULTIPLE_CHOICE',
        'A. Lagos, B. Abuja, C. Kano, D. Port Harcourt',
        'B',
        '2',
        'Abuja became the capital of Nigeria in 1991'
      ],
      [
        'Nigeria is located in West Africa',
        'TRUE_FALSE',
        '',
        'TRUE',
        '1',
        'Nigeria is indeed located in West Africa'
      ],
      [
        'The chemical symbol for water is ____',
        'FILL_BLANK',
        '',
        'H2O|H₂O',
        '1',
        'Water has the chemical formula H2O'
      ]
    ];
    
    return sampleData;
  }
}

module.exports = FileProcessor;