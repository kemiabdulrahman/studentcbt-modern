const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { generateGradeLetter } = require('./gradingService');

class ExportService {
  
  // Export Assessment Results as PDF
  static async exportResultsToPDF(assessment, attempts, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `${assessment.title.replace(/[^a-zA-Z0-9]/g, '_')}_results_${Date.now()}.pdf`;
        const filePath = path.join(process.env.UPLOAD_DIR || './src/uploads', fileName);
        
        // Create write stream
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        
        // Header
        doc.fontSize(20).text('Assessment Results Report', { align: 'center' });
        doc.moveDown();
        
        // Assessment Details
        doc.fontSize(14).text(`Assessment: ${assessment.title}`, { underline: true });
        doc.fontSize(12);
        doc.text(`Subject: ${assessment.subject?.name || 'N/A'}`);
        doc.text(`Class: ${assessment.class?.name || 'N/A'}`);
        doc.text(`Total Marks: ${assessment.totalMarks}`);
        doc.text(`Pass Marks: ${assessment.passMarks}`);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        
        // Summary Statistics
        if (attempts.length > 0) {
          const scores = attempts.map(a => a.totalScore);
          const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          const highestScore = Math.max(...scores);
          const lowestScore = Math.min(...scores);
          const passCount = attempts.filter(a => a.totalScore >= assessment.passMarks).length;
          
          doc.text('Summary Statistics:', { underline: true });
          doc.text(`Total Students: ${attempts.length}`);
          doc.text(`Average Score: ${averageScore.toFixed(2)}/${assessment.totalMarks} (${((averageScore/assessment.totalMarks)*100).toFixed(2)}%)`);
          doc.text(`Highest Score: ${highestScore}/${assessment.totalMarks}`);
          doc.text(`Lowest Score: ${lowestScore}/${assessment.totalMarks}`);
          doc.text(`Pass Rate: ${passCount}/${attempts.length} (${((passCount/attempts.length)*100).toFixed(2)}%)`);
          doc.moveDown();
        }
        
        // Student Results Table
        doc.text('Student Results:', { underline: true });
        doc.moveDown(0.5);
        
        // Table headers
        const startY = doc.y;
        const tableTop = startY;
        const itemHeight = 25;
        
        // Column positions
        const cols = {
          studentId: 50,
          name: 130,
          score: 300,
          percentage: 380,
          grade: 450,
          status: 500
        };
        
        doc.fontSize(10).fillColor('black');
        
        // Headers
        doc.text('Student ID', cols.studentId, tableTop);
        doc.text('Name', cols.name, tableTop);
        doc.text('Score', cols.score, tableTop);
        doc.text('Percentage', cols.percentage, tableTop);
        doc.text('Grade', cols.grade, tableTop);
        doc.text('Status', cols.status, tableTop);
        
        // Header line
        doc.moveTo(cols.studentId, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();
        
        // Student rows
        attempts.forEach((attempt, index) => {
          const y = tableTop + (index + 1) * itemHeight + 5;
          
          // Check for new page
          if (y > 700) {
            doc.addPage();
            return;
          }
          
          const percentage = ((attempt.totalScore / assessment.totalMarks) * 100);
          const { grade, status } = generateGradeLetter(percentage, (assessment.passMarks / assessment.totalMarks) * 100);
          
          doc.text(attempt.student.studentId, cols.studentId, y);
          doc.text(`${attempt.student.firstName} ${attempt.student.lastName}`, cols.name, y);
          doc.text(`${attempt.totalScore}/${assessment.totalMarks}`, cols.score, y);
          doc.text(`${percentage.toFixed(2)}%`, cols.percentage, y);
          doc.text(grade, cols.grade, y);
          doc.text(status, cols.status, y);
        });
        
        // Footer
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8)
             .text(`Page ${i + 1} of ${pages.count}`, 50, 750, { align: 'center' });
        }
        
        doc.end();
        
        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            mimeType: 'application/pdf'
          });
        });
        
        stream.on('error', reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Export Assessment Results as Excel
  static async exportResultsToExcel(assessment, attempts, options = {}) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Assessment Results');
      
      // Set column widths
      worksheet.columns = [
        { header: 'Student ID', key: 'studentId', width: 15 },
        { header: 'First Name', key: 'firstName', width: 20 },
        { header: 'Last Name', key: 'lastName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Total Marks', key: 'totalMarks', width: 12 },
        { header: 'Percentage', key: 'percentage', width: 12 },
        { header: 'Grade', key: 'grade', width: 8 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Time Spent (min)', key: 'timeSpent', width: 15 },
        { header: 'Submitted At', key: 'submittedAt', width: 20 }
      ];
      
      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add data rows
      attempts.forEach(attempt => {
        const percentage = ((attempt.totalScore / assessment.totalMarks) * 100);
        const { grade, status } = generateGradeLetter(percentage, (assessment.passMarks / assessment.totalMarks) * 100);
        
        worksheet.addRow({
          studentId: attempt.student.studentId,
          firstName: attempt.student.firstName,
          lastName: attempt.student.lastName,
          email: attempt.student.user?.email || 'N/A',
          score: attempt.totalScore,
          totalMarks: assessment.totalMarks,
          percentage: `${percentage.toFixed(2)}%`,
          grade: grade,
          status: status,
          timeSpent: attempt.timeSpent ? Math.round(attempt.timeSpent / 60) : 'N/A',
          submittedAt: attempt.submittedAt ? attempt.submittedAt.toLocaleString() : 'N/A'
        });
      });
      
      // Add summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      
      // Summary data
      if (attempts.length > 0) {
        const scores = attempts.map(a => a.totalScore);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);
        const passCount = attempts.filter(a => a.totalScore >= assessment.passMarks).length;
        
        summarySheet.columns = [
          { header: 'Metric', key: 'metric', width: 25 },
          { header: 'Value', key: 'value', width: 20 }
        ];
        
        summarySheet.getRow(1).font = { bold: true };
        
        summarySheet.addRows([
          { metric: 'Assessment Title', value: assessment.title },
          { metric: 'Subject', value: assessment.subject?.name || 'N/A' },
          { metric: 'Class', value: assessment.class?.name || 'N/A' },
          { metric: 'Total Marks', value: assessment.totalMarks },
          { metric: 'Pass Marks', value: assessment.passMarks },
          { metric: '', value: '' },
          { metric: 'Total Students', value: attempts.length },
          { metric: 'Average Score', value: `${averageScore.toFixed(2)}/${assessment.totalMarks}` },
          { metric: 'Highest Score', value: `${highestScore}/${assessment.totalMarks}` },
          { metric: 'Lowest Score', value: `${lowestScore}/${assessment.totalMarks}` },
          { metric: 'Students Passed', value: `${passCount}/${attempts.length}` },
          { metric: 'Pass Rate', value: `${((passCount/attempts.length)*100).toFixed(2)}%` }
        ]);
      }
      
      // Save file
      const fileName = `${assessment.title.replace(/[^a-zA-Z0-9]/g, '_')}_results_${Date.now()}.xlsx`;
      const filePath = path.join(process.env.UPLOAD_DIR || './src/uploads', fileName);
      
      await workbook.xlsx.writeFile(filePath);
      
      return {
        fileName,
        filePath,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  // Export Individual Student Answer Sheet
  static async exportStudentAnswerSheet(attempt, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `${attempt.student.studentId}_${attempt.assessment.title.replace(/[^a-zA-Z0-9]/g, '_')}_answers_${Date.now()}.pdf`;
        const filePath = path.join(process.env.UPLOAD_DIR || './src/uploads', fileName);
        
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        
        // Header
        doc.fontSize(18).text('Student Answer Sheet', { align: 'center' });
        doc.moveDown();
        
        // Student and Assessment Details
        doc.fontSize(12);
        doc.text(`Student: ${attempt.student.firstName} ${attempt.student.lastName} (${attempt.student.studentId})`);
        doc.text(`Assessment: ${attempt.assessment.title}`);
        doc.text(`Score: ${attempt.totalScore}/${attempt.assessment.totalMarks} (${attempt.percentage}%)`);
        doc.text(`Submitted: ${attempt.submittedAt?.toLocaleString() || 'N/A'}`);
        doc.moveDown();
        
        // Questions and Answers
        attempt.answers.forEach((answer, index) => {
          const question = answer.question;
          
          // Check for new page
          if (doc.y > 650) {
            doc.addPage();
          }
          
          doc.fontSize(12).fillColor('black');
          doc.text(`Question ${index + 1}: ${question.questionText}`, { underline: true });
          doc.moveDown(0.3);
          
          // Show options for MCQ
          if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
            doc.fontSize(10);
            question.options.forEach(option => {
              doc.text(`  ${option}`);
            });
            doc.moveDown(0.3);
          }
          
          doc.fontSize(11);
          doc.text(`Student Answer: ${answer.answer}`);
          doc.text(`Correct Answer: ${question.correctAnswer}`);
          
          // Score indication
          if (answer.isCorrect) {
            doc.fillColor('green').text(`✓ Correct (${answer.marksAwarded}/${question.marks} marks)`);
          } else {
            doc.fillColor('red').text(`✗ Incorrect (${answer.marksAwarded}/${question.marks} marks)`);
          }
          
          doc.fillColor('black');
          
          // Show explanation if available
          if (question.explanation) {
            doc.fontSize(9).fillColor('blue');
            doc.text(`Explanation: ${question.explanation}`);
            doc.fillColor('black');
          }
          
          doc.moveDown();
        });
        
        doc.end();
        
        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            mimeType: 'application/pdf'
          });
        });
        
        stream.on('error', reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Export Class List Template for Student Upload
  static async exportClassListTemplate(schoolClass) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Student List Template');
      
      // Set column headers
      worksheet.columns = [
        { header: 'Student ID*', key: 'studentId', width: 15 },
        { header: 'First Name*', key: 'firstName', width: 20 },
        { header: 'Last Name*', key: 'lastName', width: 20 },
        { header: 'Email*', key: 'email', width: 30 },
        { header: 'Password*', key: 'password', width: 15 }
      ];
      
      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add instruction rows
      worksheet.addRow({});
      worksheet.addRow({ studentId: 'Instructions:', firstName: '', lastName: '', email: '', password: '' });
      worksheet.addRow({ studentId: '1. Student ID must be unique', firstName: '', lastName: '', email: '', password: '' });
      worksheet.addRow({ studentId: '2. Email must be valid format', firstName: '', lastName: '', email: '', password: '' });
      worksheet.addRow({ studentId: '3. Password minimum 6 characters', firstName: '', lastName: '', email: '', password: '' });
      worksheet.addRow({ studentId: '4. All fields marked with * are required', firstName: '', lastName: '', email: '', password: '' });
      worksheet.addRow({});
      
      // Add sample data
      worksheet.addRow({
        studentId: 'STU001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        password: 'password123'
      });
      
      // Save file
      const fileName = `${schoolClass.name}_student_template_${Date.now()}.xlsx`;
      const filePath = path.join(process.env.UPLOAD_DIR || './src/uploads', fileName);
      
      await workbook.xlsx.writeFile(filePath);
      
      return {
        fileName,
        filePath,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ExportService;