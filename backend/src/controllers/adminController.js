const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Student Management
const createStudent = async (req, res) => {
  try {
    const { email, password, studentId, firstName, lastName, classId } = req.body;

    // Check if student ID already exists
    const existingStudent = await prisma.student.findUnique({
      where: { studentId }
    });

    if (existingStudent) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and student in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'STUDENT'
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentId,
          firstName,
          lastName,
          classId
        },
        include: {
          user: true,
          class: true
        }
      });

      return student;
    });

    // Remove password from response
    const { user: { password: _, ...userWithoutPassword }, ...studentData } = result;

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        ...studentData,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, classId, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (classId) {
      where.classId = classId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, isActive: true, createdAt: true }
          },
          class: true
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.count({ where })
    ]);

    res.json({
      students,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, classId, isActive } = req.body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName,
        lastName,
        classId,
        ...(isActive !== undefined && {
          user: {
            update: { isActive }
          }
        })
      },
      include: {
        user: {
          select: { id: true, email: true, isActive: true }
        },
        class: true
      }
    });

    res.json({
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!student) {
        throw new Error('Student not found');
      }

      await tx.student.delete({ where: { id } });
      await tx.user.delete({ where: { id: student.userId } });
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Class Management
const createClass = async (req, res) => {
  try {
    const { name, stream } = req.body;

    const schoolClass = await prisma.schoolClass.create({
      data: { name, stream }
    });

    res.status(201).json({
      message: 'Class created successfully',
      class: schoolClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const classes = await prisma.schoolClass.findMany({
      include: {
        _count: {
          select: { students: true, assessments: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Subject Management
const createSubject = async (req, res) => {
  try {
    const { name } = req.body;

    const subject = await prisma.subject.create({
      data: { name }
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { assessments: true, classSubjects: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Class-Subject Assignment
const assignSubjectToClass = async (req, res) => {
  try {
    const { classId, subjectId } = req.body;

    const classSubject = await prisma.classSubject.create({
      data: { classId, subjectId },
      include: {
        class: true,
        subject: true
      }
    });

    res.status(201).json({
      message: 'Subject assigned to class successfully',
      classSubject
    });
  } catch (error) {
    console.error('Assign subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getClassSubjects = async (req, res) => {
  try {
    const { classId } = req.params;

    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: {
        subject: true
      }
    });

    res.json({ classSubjects });
  } catch (error) {
    console.error('Get class subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  createClass,
  getAllClasses,
  createSubject,
  getAllSubjects,
  assignSubjectToClass,
  getClassSubjects
};