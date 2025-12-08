const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await prisma.answer.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.attempt.deleteMany({});
    await prisma.assessment.deleteMany({});
    await prisma.classSubject.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.schoolClass.deleteMany({});
    await prisma.subject.deleteMany({});

    // Create subjects
    console.log('📚 Creating subjects...');
    const subjects = await Promise.all([
      prisma.subject.create({ data: { name: 'Mathematics' } }),
      prisma.subject.create({ data: { name: 'English Language' } }),
      prisma.subject.create({ data: { name: 'Biology' } }),
      prisma.subject.create({ data: { name: 'Chemistry' } }),
      prisma.subject.create({ data: { name: 'Physics' } }),
      prisma.subject.create({ data: { name: 'History' } }),
      prisma.subject.create({ data: { name: 'Geography' } })
    ]);

    // Create school classes
    console.log('🏫 Creating school classes...');
    const classes = await Promise.all([
      prisma.schoolClass.create({ data: { name: 'JSS1', stream: 'General' } }),
      prisma.schoolClass.create({ data: { name: 'JSS2', stream: 'General' } }),
      prisma.schoolClass.create({ data: { name: 'JSS3', stream: 'General' } }),
      prisma.schoolClass.create({ data: { name: 'SS1', stream: 'Science' } }),
      prisma.schoolClass.create({ data: { name: 'SS1', stream: 'Arts' } }),
      prisma.schoolClass.create({ data: { name: 'SS2', stream: 'Science' } })
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        role: 'ADMIN'
      }
    });

    // Create student users
    console.log('👨‍🎓 Creating student users...');
    const studentUsers = [];
    for (let i = 1; i <= 10; i++) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      const user = await prisma.user.create({
        data: {
          email: `student${i}@example.com`,
          password: hashedPassword,
          role: 'STUDENT'
        }
      });
      studentUsers.push(user);
    }

    // Create student profiles
    console.log('📝 Creating student profiles...');
    const students = [];
    for (let i = 0; i < studentUsers.length; i++) {
      const classIndex = i % classes.length;
      const student = await prisma.student.create({
        data: {
          userId: studentUsers[i].id,
          studentId: `STU${String(i + 1).padStart(5, '0')}`,
          firstName: `Student`,
          lastName: `${i + 1}`,
          classId: classes[classIndex].id
        }
      });
      students.push(student);
    }

    // Create class-subject associations
    console.log('🔗 Creating class-subject associations...');
    for (const schoolClass of classes) {
      // Associate all subjects with each class
      for (const subject of subjects) {
        await prisma.classSubject.create({
          data: {
            classId: schoolClass.id,
            subjectId: subject.id
          }
        });
      }
    }

    // Create assessments
    console.log('📋 Creating assessments...');
    const assessments = [];
    for (let i = 0; i < 5; i++) {
      const assessment = await prisma.assessment.create({
        data: {
          title: `${subjects[i].name} Quiz ${i + 1}`,
          description: `A comprehensive quiz on ${subjects[i].name}`,
          classId: classes[0].id,
          subjectId: subjects[i].id,
          duration: 60,
          totalMarks: 100,
          passMarks: 50,
          status: 'PUBLISHED',
          showResults: true,
          instructions: 'Answer all questions to the best of your knowledge.'
        }
      });
      assessments.push(assessment);
    }

    // Create questions for each assessment
    console.log('❓ Creating questions...');
    const questionTexts = {
      0: [
        'What is 2 + 2?',
        'What is the square root of 144?',
        'What is 15 × 8?',
        'What is 100 ÷ 5?',
        'What is the value of π approximately?'
      ],
      1: [
        'What is the plural of "child"?',
        'Which word is a noun?',
        'What is the past tense of "go"?',
        'Which sentence is grammatically correct?',
        'What does "ubiquitous" mean?'
      ],
      2: [
        'What is the basic unit of life?',
        'What do plants produce during photosynthesis?',
        'How many chambers does a human heart have?',
        'What is the process by which plants make food?',
        'What type of blood cells fight infections?'
      ],
      3: [
        'What is the chemical symbol for gold?',
        'How many electrons does oxygen have?',
        'What is the pH of a neutral solution?',
        'What is the process of breaking down rocks?',
        'What is a covalent bond?'
      ],
      4: [
        'What is the SI unit of force?',
        'What does Newton\'s first law state?',
        'What is the speed of light?',
        'What is the formula for kinetic energy?',
        'What is the SI unit of energy?'
      ]
    };

    const answers = {
      0: ['4', '12', '120', '20', '3.14'],
      1: ['children', 'book', 'went', 'She go to school', 'widespread'],
      2: ['cell', 'oxygen', '4', 'photosynthesis', 'white blood cells'],
      3: ['Au', '8', '7', 'weathering', 'a shared electron bond'],
      4: ['newton', 'an object remains at rest', '300000000 m/s', 'KE = 1/2 mv²', 'joule']
    };

    for (let assessmentIndex = 0; assessmentIndex < assessments.length; assessmentIndex++) {
      const questions = questionTexts[assessmentIndex] || [];
      const correctAnswers = answers[assessmentIndex] || [];

      for (let q = 0; q < Math.min(questions.length, 5); q++) {
        await prisma.question.create({
          data: {
            assessmentId: assessments[assessmentIndex].id,
            questionText: questions[q],
            questionType: 'MULTIPLE_CHOICE',
            options: [correctAnswers[q], 'Option B', 'Option C', 'Option D'],
            correctAnswer: correctAnswers[q],
            marks: 20,
            explanation: `The correct answer is ${correctAnswers[q]}.`,
            orderIndex: q + 1
          }
        });
      }
    }

    // Create some attempts for testing
    console.log('📊 Creating assessment attempts...');
    for (let i = 0; i < Math.min(3, students.length); i++) {
      for (let a = 0; a < Math.min(2, assessments.length); a++) {
        const attempt = await prisma.attempt.create({
          data: {
            studentId: students[i].id,
            assessmentId: assessments[a].id,
            status: 'SUBMITTED',
            totalScore: Math.floor(Math.random() * 100),
            percentage: Math.floor(Math.random() * 100),
            submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            timeSpent: Math.floor(Math.random() * 3600)
          }
        });

        // Create some answers for the attempt
        const questionsForAssessment = await prisma.question.findMany({
          where: { assessmentId: assessments[a].id }
        });

        for (const question of questionsForAssessment) {
          const isCorrect = Math.random() > 0.3;
          await prisma.answer.create({
            data: {
              attemptId: attempt.id,
              questionId: question.id,
              answer: isCorrect ? question.correctAnswer : 'Wrong Answer',
              isCorrect,
              marksAwarded: isCorrect ? question.marks : 0
            }
          });
        }
      }
    }

    console.log('✅ Database seed completed successfully!');
    console.log('\n📖 Seed Data Summary:');
    console.log(`  - Subjects: ${subjects.length}`);
    console.log(`  - Classes: ${classes.length}`);
    console.log(`  - Admin Users: 1 (admin@example.com / admin123)`);
    console.log(`  - Students: ${students.length}`);
    console.log(`  - Assessments: ${assessments.length}`);
    console.log(`  - Questions: ~${assessments.length * 5}`);
    console.log(`  - Attempts: ~${Math.min(3, students.length) * Math.min(2, assessments.length)}`);
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
