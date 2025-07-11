const express = require('express');
const Submission = require('../models/Submission');
const Paper = require('../models/Paper');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Submit paper (students only)
router.post('/', auth, requireRole(['student']), async (req, res) => {
  try {
    const { paperId, answers, timeSpent } = req.body;

    // Get paper with questions
    const paper = await Paper.findById(paperId);
    if (!paper || !paper.isActive) {
      return res.status(404).json({ message: 'Paper not found or not active' });
    }

    // Check if due date passed
    if (new Date() > paper.dueDate) {
      return res.status(400).json({ message: 'Paper submission deadline has passed' });
    }

    // Check attempt limit
    const previousAttempts = await Submission.countDocuments({
      student: req.user._id,
      paper: paperId
    });

    if (previousAttempts >= paper.allowedAttempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    // Grade the answers
    const gradedAnswers = answers.map((answer, index) => {
      const question = paper.questions[index];
      const selectedOption = question.options[answer.selectedOption];
      const isCorrect = selectedOption ? selectedOption.isCorrect : false;
      
      return {
        questionId: question._id,
        selectedOption: answer.selectedOption,
        isCorrect,
        points: isCorrect ? question.points : 0
      };
    });

    // Create submission
    const submission = new Submission({
      student: req.user._id,
      paper: paperId,
      answers: gradedAnswers,
      timeSpent,
      isCompleted: true,
      attemptNumber: previousAttempts + 1
    });

    // Calculate percentage
    submission.percentage = paper.totalPoints > 0 
      ? Math.round((submission.totalScore / paper.totalPoints) * 100) 
      : 0;

    await submission.save();
    await submission.populate([
      { path: 'student', select: 'name email studentId' },
      { path: 'paper', select: 'title totalPoints' }
    ]);

    res.status(201).json({
      message: 'Paper submitted successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's submissions
router.get('/my-submissions', auth, requireRole(['student']), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('paper', 'title totalPoints dueDate')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get submissions for a paper (lecturers only)
router.get('/paper/:paperId', auth, requireRole(['lecturer']), async (req, res) => {
  try {
    // Verify lecturer owns the paper
    const paper = await Paper.findOne({ _id: req.params.paperId, lecturer: req.user._id });
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found or unauthorized' });
    }

    const submissions = await Submission.find({ paper: req.params.paperId })
      .populate('student', 'name email studentId department')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single submission details
router.get('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Students can only see their own submissions
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const submission = await Submission.findOne(query)
      .populate('student', 'name email studentId department')
      .populate('paper', 'title questions totalPoints');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // If lecturer, verify they own the paper
    if (req.user.role === 'lecturer' && submission.paper.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;