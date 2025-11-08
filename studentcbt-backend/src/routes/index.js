const express = require('express');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const studentRoutes = require('./student');
const assessmentRoutes = require('./assessment');
const uploadRoutes = require('./upload');

const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.json({
    message: 'StudentCBT API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      student: '/api/student',
      assessment: '/api/assessment',
      upload: '/api/upload'
    }
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/student', studentRoutes);
router.use('/assessment', assessmentRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;