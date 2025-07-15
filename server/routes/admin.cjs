const express = require('express');
const User = require('../models/User.cjs');
const Paper = require('../models/Paper.cjs');
const Submission = require('../models/Submission.cjs');
const { auth, requireRole } = require('../middleware/auth.cjs');

const router = express.Router();

// Get dashboard stats (admin only)
router.get('/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalLecturers = await User.countDocuments({ role: 'lecturer' });
    const totalPapers = await Paper.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      totalUsers,
      totalStudents,
      totalLecturers,
      totalPapers,
      totalSubmissions,
      activeUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle user active status (admin only)
router.patch('/users/:id/toggle-status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all papers (admin only)
router.get('/papers', auth, requireRole(['admin']), async (req, res) => {
  try {
    const papers = await Paper.find()
      .populate('lecturer', 'name email')
      .sort({ createdAt: -1 });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all submissions (admin only)
router.get('/submissions', auth, requireRole(['admin']), async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('student', 'name email studentId')
      .populate('paper', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;