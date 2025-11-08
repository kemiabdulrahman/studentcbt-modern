const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@cbt.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log(`✅ Default admin already exists: ${adminEmail}`);
      return existingAdmin;
    }
    
    // Create default admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log(`✅ Default admin created successfully: ${adminEmail}`);
    console.log(`🔑 Default password: ${adminPassword}`);
    console.log(`⚠️  Please change the default password after first login!`);
    
    return admin;
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    throw error;
  }
};

const seedSampleData = async () => {
  try {
    console.log('🌱 Seeding sample data...');
    
    // Create sample classes
    const classes = await Promise.all([
      prisma.schoolClass.upsert({
        where: { 
          name_stream: { name: 'JSS1', stream: null }
        },
        update: {},
        create: { name: 'JSS1', stream: null }
      }),
      prisma.schoolClass.upsert({
        where: { 
          name_stream: { name: 'JSS2', stream: null }
        },
        update: {},
        create: { name: 'JSS2', stream: null }
      }),
      prisma.schoolClass.upsert({
        where: { 
          name_stream: { name: 'JSS3', stream: null }
        },
        update: {},
        create: { name: 'JSS3', stream: null }
      }),
      prisma.schoolClass.upsert({
        where: { 
          name_stream: { name: 'SS1', stream: 'Science' }
        },
        update: {},
        create: { name: 'SS1', stream: 'Science' }
      }),
      prisma.schoolClass.upsert({
        where: { 
          name_stream: { name: 'SS2', stream: 'Science' }
        },
        update: {},
        create: { name: 'SS2', stream: 'Science' }
      }),
      prisma.schoolClass.upsert({
        where: { 
          name_stream: { name: 'SS3', stream: 'Science' }
        },
        update: {},
        create: { name: 'SS3', stream: 'Science' }
      })
    ]);
    
    // Create sample subjects
    const subjects = await Promise.all([
      prisma.subject.upsert({
        where: { name: 'Mathematics' },
        update: {},
        create: { name: 'Mathematics' }
      }),
      prisma.subject.upsert({
        where: { name: 'English Language' },
        update: {},
        create: { name: 'English Language' }
      }),
      prisma.subject.upsert({
        where: { name: 'Physics' },
        update: {},
        create: { name: 'Physics' }
      }),
      prisma.subject.upsert({
        where: { name: 'Chemistry' },
        update: {},
        create: { name: 'Chemistry' }
      }),
      prisma.subject.upsert({
        where: { name: 'Biology' },
        update: {},
        create: { name: 'Biology' }
      }),
      prisma.subject.upsert({
        where: { name: 'Computer Science' },
        update: {},
        create: { name: 'Computer Science' }
      })
    ]);
    
    // Assign subjects to classes
    const classSubjectAssignments = [
      // JSS classes - basic subjects
      { classId: classes[0].id, subjectId: subjects[0].id }, // JSS1 - Math
      { classId: classes[0].id, subjectId: subjects[1].id }, // JSS1 - English
      { classId: classes[1].id, subjectId: subjects[0].id }, // JSS2 - Math
      { classId: classes[1].id, subjectId: subjects[1].id }, // JSS2 - English
      { classId: classes[2].id, subjectId: subjects[0].id }, // JSS3 - Math
      { classId: classes[2].id, subjectId: subjects[1].id }, // JSS3 - English
      
      // SS Science classes - all subjects
      { classId: classes[3].id, subjectId: subjects[0].id }, // SS1 Science - Math
      { classId: classes[3].id, subjectId: subjects[1].id }, // SS1 Science - English
      { classId: classes[3].id, subjectId: subjects[2].id }, // SS1 Science - Physics
      { classId: classes[3].id, subjectId: subjects[3].id }, // SS1 Science - Chemistry
      { classId: classes[3].id, subjectId: subjects[4].id }, // SS1 Science - Biology
      { classId: classes[4].id, subjectId: subjects[0].id }, // SS2 Science - Math
      { classId: classes[4].id, subjectId: subjects[2].id }, // SS2 Science - Physics
      { classId: classes[4].id, subjectId: subjects[3].id }, // SS2 Science - Chemistry
      { classId: classes[5].id, subjectId: subjects[0].id }, // SS3 Science - Math
      { classId: classes[5].id, subjectId: subjects[2].id }, // SS3 Science - Physics
      { classId: classes[5].id, subjectId: subjects[5].id }  // SS3 Science - Computer Science
    ];
    
    for (const assignment of classSubjectAssignments) {
      await prisma.classSubject.upsert({
        where: {
          classId_subjectId: {
            classId: assignment.classId,
            subjectId: assignment.subjectId
          }
        },
        update: {},
        create: assignment
      });
    }
    
    // Create sample students
    const sampleStudents = [
      {
        email: 'john.doe@student.com',
        password: 'student123',
        studentId: 'STU001',
        firstName: 'John',
        lastName: 'Doe',
        classId: classes[0].id // JSS1
      },
      {
        email: 'jane.smith@student.com',
        password: 'student123',
        studentId: 'STU002',
        firstName: 'Jane',
        lastName: 'Smith',
        classId: classes[0].id // JSS1
      },
      {
        email: 'mike.johnson@student.com',
        password: 'student123',
        studentId: 'STU003',
        firstName: 'Mike',
        lastName: 'Johnson',
        classId: classes[3].id // SS1 Science
      }
    ];
    
    for (const studentData of sampleStudents) {
      const existingUser = await prisma.user.findUnique({
        where: { email: studentData.email }
      });
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(studentData.password, 10);
        
        await prisma.user.create({
          data: {
            email: studentData.email,
            password: hashedPassword,
            role: 'STUDENT',
            student: {
              create: {
                studentId: studentData.studentId,
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                classId: studentData.classId
              }
            }
          }
        });
      }
    }
    
    // Create a sample assessment with questions
    const mathClass = classes[0]; // JSS1
    const mathSubject = subjects[0]; // Mathematics
    
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        title: 'Sample Mathematics Assessment',
        classId: mathClass.id,
        subjectId: mathSubject.id
      }
    });
    
    if (!existingAssessment) {
      const assessment = await prisma.assessment.create({
        data: {
          title: 'Sample Mathematics Assessment',
          description: 'A sample assessment for JSS1 Mathematics',
          subjectId: mathSubject.id,
          classId: mathClass.id,
          duration: 30,
          passMarks: 6,
          totalMarks: 10,
          status: 'PUBLISHED',
          showResults: true,
          instructions: 'Read all questions carefully before answering. You have 30 minutes to complete this assessment.'
        }
      });
      
      // Add sample questions
      const sampleQuestions = [
        {
          questionText: 'What is 5 + 3?',
          questionType: 'MULTIPLE_CHOICE',
          options: ['A. 6', 'B. 7', 'C. 8', 'D. 9'],
          correctAnswer: 'C',
          marks: 2,
          explanation: '5 + 3 equals 8',
          orderIndex: 1
        },
        {
          questionText: 'Is 10 greater than 5?',
          questionType: 'TRUE_FALSE',
          correctAnswer: 'TRUE',
          marks: 1,
          explanation: '10 is indeed greater than 5',
          orderIndex: 2
        },
        {
          questionText: 'What is 12 ÷ 4?',
          questionType: 'FILL_BLANK',
          correctAnswer: '3',
          marks: 2,
          explanation: '12 divided by 4 equals 3',
          orderIndex: 3
        },
        {
          questionText: 'Which of the following is an even number?',
          questionType: 'MULTIPLE_CHOICE',
          options: ['A. 13', 'B. 15', 'C. 17', 'D. 18'],
          correctAnswer: 'D',
          marks: 2,
          explanation: '18 is divisible by 2, making it even',
          orderIndex: 4
        },
        {
          questionText: 'Zero is a natural number.',
          questionType: 'TRUE_FALSE',
          correctAnswer: 'FALSE',
          marks: 1,
          explanation: 'Zero is not considered a natural number',
          orderIndex: 5
        },
        {
          questionText: 'What is 7 × 3?',
          questionType: 'FILL_BLANK',
          correctAnswer: '21',
          marks: 2,
          explanation: '7 multiplied by 3 equals 21',
          orderIndex: 6
        }
      ];
      
      for (const questionData of sampleQuestions) {
        await prisma.question.create({
          data: {
            ...questionData,
            assessmentId: assessment.id
          }
        });
      }
    }
    
    console.log('✅ Sample data seeded successfully!');
    console.log(`📚 Created ${classes.length} classes`);
    console.log(`📖 Created ${subjects.length} subjects`);
    console.log(`👥 Created ${sampleStudents.length} sample students`);
    console.log(`📝 Created sample assessment with questions`);
    
  } catch (error) {
    console.error('❌ Error seeding sample data:', error.message);
    throw error;
  }
};

const clearAllData = async () => {
  try {
    console.log('🧹 Clearing all data...');
    
    // Delete in correct order to avoid foreign key constraints
    await prisma.answer.deleteMany();
    await prisma.attempt.deleteMany();
    await prisma.question.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.classSubject.deleteMany();
    await prisma.student.deleteMany();
    await prisma.user.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.schoolClass.deleteMany();
    
    console.log('✅ All data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    throw error;
  }
};

module.exports = {
  createDefaultAdmin,
  seedSampleData,
  clearAllData
};