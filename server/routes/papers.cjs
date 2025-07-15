const express = require('express');
const Paper = require('../models/Paper.cjs');
const { auth, requireRole } = require('../middleware/auth.cjs');

const router = express.Router();

// Get all papers (for students - only active ones)
router.get('/', auth, async (req, res) => {
  try {
    let query = { isActive: true };
    
    // If lecturer, show their papers
    if (req.user.role === 'lecturer') {
      query = { lecturer: req.user._id };
    }

    const papers = await Paper.find(query)
      .populate('lecturer', 'name email')
      .sort({ createdAt: -1 });

    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single paper
router.get('/:id', auth, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id)
      .populate('lecturer', 'name email');

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Students can only see active papers
    if (req.user.role === 'student' && !paper.isActive) {
      return res.status(403).json({ message: 'Paper not available' });
    }

    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create paper (lecturers only)
router.post('/', auth, requireRole(['lecturer']), async (req, res) => {
  try {
    const { title, description, questions, timeLimit, dueDate, allowedAttempts } = req.body;

    const paper = new Paper({
      title,
      description,
      lecturer: req.user._id,
      questions,
      timeLimit,
      dueDate,
      allowedAttempts
    });

    await paper.save();
    await paper.populate('lecturer', 'name email');

    res.status(201).json({
      message: 'Paper created successfully',
      paper
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update paper (lecturers only)
router.put('/:id', auth, requireRole(['lecturer']), async (req, res) => {
  try {
    const paper = await Paper.findOne({ _id: req.params.id, lecturer: req.user._id });
    
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found or unauthorized' });
    }

    Object.assign(paper, req.body);
    await paper.save();
    await paper.populate('lecturer', 'name email');

    res.json({
      message: 'Paper updated successfully',
      paper
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete paper (lecturers only)
router.delete('/:id', auth, requireRole(['lecturer']), async (req, res) => {
  try {
    const paper = await Paper.findOneAndDelete({ _id: req.params.id, lecturer: req.user._id });
    
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found or unauthorized' });
    }

    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;