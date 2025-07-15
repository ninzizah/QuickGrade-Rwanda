const express = require('express');
const aiService = require('../services/aiService.cjs');
const { auth, requireRole } = require('../middleware/auth.cjs');

const router = express.Router();

// Generate AI questions for a paper
router.post('/generate-questions', auth, requireRole(['lecturer']), async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    if (count > 20) {
      return res.status(400).json({ message: 'Maximum 20 questions allowed per generation' });
    }

    console.log(`Generating ${count} questions for topic: ${topic}`);
    
    const questions = await aiService.generateMCQQuestions(topic, difficulty, count);

    res.json({
      message: 'Questions generated successfully',
      questions: questions,
      topic: topic,
      difficulty: difficulty,
      count: questions.length
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      message: 'Failed to generate questions', 
      error: error.message 
    });
  }
});

// Get available topics
router.get('/topics', auth, async (req, res) => {
  try {
    const topics = aiService.getAvailableTopics();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get topics', error: error.message });
  }
});

// Evaluate an answer using AI
router.post('/evaluate-answer', auth, requireRole(['lecturer']), async (req, res) => {
  try {
    const { question, correctAnswer, studentAnswer } = req.body;

    if (!question || !correctAnswer || !studentAnswer) {
      return res.status(400).json({ message: 'Question, correct answer, and student answer are required' });
    }

    const evaluation = await aiService.evaluateAnswer(question, correctAnswer, studentAnswer);

    res.json({
      message: 'Answer evaluated successfully',
      evaluation: evaluation
    });
  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ 
      message: 'Failed to evaluate answer', 
      error: error.message 
    });
  }
});

// Check AI service health
router.get('/health', auth, async (req, res) => {
  try {
    const health = await aiService.checkAPIHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to check AI service health',
      error: error.message 
    });
  }
});

// Get AI-powered question suggestions
router.post('/suggest-questions', auth, requireRole(['lecturer']), async (req, res) => {
  try {
    const { existingQuestions, topic, difficulty = 'medium' } = req.body;

    // Generate suggestions based on existing questions
    const suggestions = await aiService.generateMCQQuestions(
      `${topic} (avoid similar questions)`, 
      difficulty, 
      3
    );

    res.json({
      message: 'Question suggestions generated',
      suggestions: suggestions
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ 
      message: 'Failed to generate suggestions', 
      error: error.message 
    });
  }
});

module.exports = router;