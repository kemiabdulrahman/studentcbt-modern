const normalizeAnswer = (answer) => {
  if (typeof answer !== 'string') {
    return String(answer).toLowerCase().trim();
  }
  return answer.toLowerCase().trim();
};

const calculateQuestionScore = (question, studentAnswer) => {
  const normalizedStudentAnswer = normalizeAnswer(studentAnswer);
  const normalizedCorrectAnswer = normalizeAnswer(question.correctAnswer);
  
  let isCorrect = false;
  let marksAwarded = 0;

  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
      isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
      marksAwarded = isCorrect ? question.marks : 0;
      break;

    case 'TRUE_FALSE':
      isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
      marksAwarded = isCorrect ? question.marks : 0;
      break;

    case 'FILL_BLANK':
      // For fill-in-the-blank, we can have multiple acceptable answers
      const acceptableAnswers = normalizedCorrectAnswer.split('|').map(ans => ans.trim());
      isCorrect = acceptableAnswers.some(ans => {
        // Check for exact match first
        if (normalizedStudentAnswer === ans) return true;
        
        // Check for partial match (70% similarity)
        const similarity = calculateStringSimilarity(normalizedStudentAnswer, ans);
        return similarity >= 0.7;
      });
      marksAwarded = isCorrect ? question.marks : 0;
      break;

    default:
      throw new Error(`Unknown question type: ${question.questionType}`);
  }

  return {
    isCorrect,
    marksAwarded,
    maxMarks: question.marks
  };
};

const calculateStringSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

const calculateAttemptScore = (answers) => {
  const totalMarks = answers.reduce((sum, answer) => sum + answer.marksAwarded, 0);
  const maxPossibleMarks = answers.reduce((sum, answer) => sum + answer.question.marks, 0);
  const percentage = maxPossibleMarks > 0 ? (totalMarks / maxPossibleMarks) * 100 : 0;
  
  return {
    totalMarks,
    maxPossibleMarks,
    percentage: parseFloat(percentage.toFixed(2))
  };
};

const generateGradeLetter = (percentage, passMarks = 50) => {
  if (percentage >= 90) return { grade: 'A+', status: 'Excellent' };
  if (percentage >= 80) return { grade: 'A', status: 'Very Good' };
  if (percentage >= 70) return { grade: 'B+', status: 'Good' };
  if (percentage >= 60) return { grade: 'B', status: 'Above Average' };
  if (percentage >= passMarks) return { grade: 'C', status: 'Pass' };
  return { grade: 'F', status: 'Fail' };
};

const analyzeQuestionPerformance = (question, answers) => {
  const totalAttempts = answers.length;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  const incorrectAnswers = totalAttempts - correctAnswers;
  
  const successRate = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
  const averageMarks = totalAttempts > 0 
    ? answers.reduce((sum, answer) => sum + answer.marksAwarded, 0) / totalAttempts 
    : 0;
  
  let difficulty = 'Medium';
  if (successRate >= 80) difficulty = 'Easy';
  else if (successRate <= 40) difficulty = 'Hard';
  
  // For multiple choice, analyze option distribution
  let optionAnalysis = null;
  if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
    optionAnalysis = {};
    question.options.forEach(option => {
      const optionKey = normalizeAnswer(option.substring(0, 1)); // Get A, B, C, etc.
      optionAnalysis[optionKey] = answers.filter(
        answer => normalizeAnswer(answer.answer) === optionKey
      ).length;
    });
  }
  
  return {
    questionId: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    totalAttempts,
    correctAnswers,
    incorrectAnswers,
    successRate: parseFloat(successRate.toFixed(2)),
    averageMarks: parseFloat(averageMarks.toFixed(2)),
    maxMarks: question.marks,
    difficulty,
    optionAnalysis
  };
};

const generateAssessmentAnalytics = (assessment, attempts) => {
  const completedAttempts = attempts.filter(attempt => 
    ['SUBMITTED', 'TIMED_OUT'].includes(attempt.status)
  );
  
  if (completedAttempts.length === 0) {
    return {
      totalAttempts: 0,
      completionRate: 0,
      averageScore: 0,
      averagePercentage: 0,
      highestScore: 0,
      lowestScore: 0,
      passCount: 0,
      failCount: 0,
      gradeDistribution: {},
      averageTimeSpent: 0
    };
  }
  
  const scores = completedAttempts.map(attempt => attempt.totalScore);
  const percentages = completedAttempts.map(attempt => attempt.percentage);
  const timesSpent = completedAttempts
    .filter(attempt => attempt.timeSpent)
    .map(attempt => attempt.timeSpent);
  
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const averagePercentage = percentages.reduce((sum, perc) => sum + perc, 0) / percentages.length;
  const averageTimeSpent = timesSpent.length > 0 
    ? timesSpent.reduce((sum, time) => sum + time, 0) / timesSpent.length 
    : 0;
  
  const passCount = completedAttempts.filter(
    attempt => attempt.totalScore >= assessment.passMarks
  ).length;
  const failCount = completedAttempts.length - passCount;
  
  // Grade distribution
  const gradeDistribution = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };
  completedAttempts.forEach(attempt => {
    const { grade } = generateGradeLetter(attempt.percentage, 
      (assessment.passMarks / assessment.totalMarks) * 100
    );
    gradeDistribution[grade]++;
  });
  
  return {
    totalAttempts: completedAttempts.length,
    completionRate: parseFloat(((completedAttempts.length / attempts.length) * 100).toFixed(2)),
    averageScore: parseFloat(averageScore.toFixed(2)),
    averagePercentage: parseFloat(averagePercentage.toFixed(2)),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    passCount,
    failCount,
    passRate: parseFloat(((passCount / completedAttempts.length) * 100).toFixed(2)),
    gradeDistribution,
    averageTimeSpent: Math.round(averageTimeSpent) // in seconds
  };
};

const validateAssessmentQuestions = (questions) => {
  const errors = [];
  
  questions.forEach((question, index) => {
    const questionNum = index + 1;
    
    // Basic validation
    if (!question.questionText || question.questionText.trim() === '') {
      errors.push(`Question ${questionNum}: Question text is required`);
    }
    
    if (!question.correctAnswer || question.correctAnswer.trim() === '') {
      errors.push(`Question ${questionNum}: Correct answer is required`);
    }
    
    if (!question.marks || question.marks < 1) {
      errors.push(`Question ${questionNum}: Marks must be at least 1`);
    }
    
    // Question type specific validation
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
          errors.push(`Question ${questionNum}: Multiple choice questions must have at least 2 options`);
        } else {
          // Validate that correct answer matches one of the options
          const correctAnswerKey = normalizeAnswer(question.correctAnswer);
          const optionKeys = question.options.map(opt => normalizeAnswer(opt.substring(0, 1)));
          if (!optionKeys.includes(correctAnswerKey)) {
            errors.push(`Question ${questionNum}: Correct answer must match one of the option keys (A, B, C, etc.)`);
          }
        }
        break;
        
      case 'TRUE_FALSE':
        const tfAnswer = normalizeAnswer(question.correctAnswer);
        if (!['true', 'false', 't', 'f'].includes(tfAnswer)) {
          errors.push(`Question ${questionNum}: True/False questions must have 'true' or 'false' as correct answer`);
        }
        break;
        
      case 'FILL_BLANK':
        // Fill in the blank answers can be validated for reasonable length
        if (question.correctAnswer.length > 200) {
          errors.push(`Question ${questionNum}: Fill-in-the-blank answer seems too long (max 200 characters)`);
        }
        break;
        
      default:
        errors.push(`Question ${questionNum}: Invalid question type '${question.questionType}'`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  normalizeAnswer,
  calculateQuestionScore,
  calculateAttemptScore,
  generateGradeLetter,
  analyzeQuestionPerformance,
  generateAssessmentAnalytics,
  validateAssessmentQuestions,
  calculateStringSimilarity
};