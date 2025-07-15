const { HfInference } = require('@huggingface/inference');
const axios = require('axios');

class AIService {
  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    this.questionModel = process.env.AI_QUESTION_MODEL || 'google/flan-t5-large';
    this.gradingModel = process.env.AI_GRADING_MODEL || 'microsoft/deberta-v3-large';
  }

  // Generate MCQ questions from a topic using AI
  async generateMCQQuestions(topic, difficulty = 'medium', count = 5) {
    try {
      console.log(`Generating ${count} ${difficulty} questions for topic: ${topic}`);
      
      const questions = [];
      
      for (let i = 0; i < count; i++) {
        const prompt = this.createQuestionPrompt(topic, difficulty, i + 1);
        
        try {
          const response = await this.hf.textGeneration({
            model: this.questionModel,
            inputs: prompt,
            parameters: {
              max_new_tokens: 200,
              temperature: 0.7,
              do_sample: true,
              return_full_text: false
            }
          });

          const question = this.parseGeneratedQuestion(response.generated_text, i + 1);
          if (question) {
            questions.push(question);
          }
        } catch (error) {
          console.error(`Error generating question ${i + 1}:`, error);
          // Fallback to template question
          questions.push(this.createFallbackQuestion(topic, i + 1));
        }
      }

      return questions.length > 0 ? questions : this.createDefaultQuestions(topic, count);
    } catch (error) {
      console.error('Error in generateMCQQuestions:', error);
      return this.createDefaultQuestions(topic, count);
    }
  }

  // Create prompt for question generation
  createQuestionPrompt(topic, difficulty, questionNumber) {
    const difficultyInstructions = {
      easy: 'Create a basic, straightforward question suitable for beginners.',
      medium: 'Create a moderately challenging question that requires some understanding.',
      hard: 'Create an advanced question that requires deep knowledge and critical thinking.'
    };

    return `Generate a multiple choice question about ${topic}. 
${difficultyInstructions[difficulty]}

Format your response exactly like this:
Question: [Your question here]
A) [First option]
B) [Second option] 
C) [Third option]
D) [Fourth option]
Correct Answer: [A, B, C, or D]
Explanation: [Brief explanation of why this is correct]

Topic: ${topic}
Difficulty: ${difficulty}
Question ${questionNumber}:`;
  }

  // Parse the AI-generated response into structured question
  parseGeneratedQuestion(text, questionNumber) {
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      let question = '';
      let options = [];
      let correctAnswer = '';
      let explanation = '';

      for (const line of lines) {
        if (line.startsWith('Question:')) {
          question = line.replace('Question:', '').trim();
        } else if (line.match(/^[A-D]\)/)) {
          options.push({
            text: line.substring(2).trim(),
            isCorrect: false
          });
        } else if (line.startsWith('Correct Answer:')) {
          correctAnswer = line.replace('Correct Answer:', '').trim().toUpperCase();
        } else if (line.startsWith('Explanation:')) {
          explanation = line.replace('Explanation:', '').trim();
        }
      }

      // Set the correct answer
      if (correctAnswer && options.length >= 4) {
        const correctIndex = correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        if (correctIndex >= 0 && correctIndex < options.length) {
          options[correctIndex].isCorrect = true;
        }
      }

      if (question && options.length >= 4 && options.some(opt => opt.isCorrect)) {
        return {
          question: question,
          options: options,
          points: 1,
          explanation: explanation,
          aiGenerated: true
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing generated question:', error);
      return null;
    }
  }

  // Create fallback question when AI fails
  createFallbackQuestion(topic, questionNumber) {
    const fallbackQuestions = {
      mathematics: {
        question: `What is the result of 2 + 2?`,
        options: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: true },
          { text: '5', isCorrect: false },
          { text: '6', isCorrect: false }
        ]
      },
      science: {
        question: `What is the chemical symbol for water?`,
        options: [
          { text: 'H2O', isCorrect: true },
          { text: 'CO2', isCorrect: false },
          { text: 'O2', isCorrect: false },
          { text: 'N2', isCorrect: false }
        ]
      },
      history: {
        question: `In which year did Rwanda gain independence?`,
        options: [
          { text: '1960', isCorrect: false },
          { text: '1962', isCorrect: true },
          { text: '1964', isCorrect: false },
          { text: '1966', isCorrect: false }
        ]
      }
    };

    const topicKey = topic.toLowerCase();
    const template = fallbackQuestions[topicKey] || fallbackQuestions.mathematics;

    return {
      question: template.question,
      options: template.options,
      points: 1,
      explanation: 'This is a fallback question.',
      aiGenerated: false
    };
  }

  // Create default questions when everything fails
  createDefaultQuestions(topic, count) {
    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push({
        question: `Sample question ${i + 1} about ${topic}`,
        options: [
          { text: 'Option A', isCorrect: i % 4 === 0 },
          { text: 'Option B', isCorrect: i % 4 === 1 },
          { text: 'Option C', isCorrect: i % 4 === 2 },
          { text: 'Option D', isCorrect: i % 4 === 3 }
        ],
        points: 1,
        explanation: 'This is a sample question.',
        aiGenerated: false
      });
    }
    return questions;
  }

  // AI-powered answer evaluation (for open-ended questions)
  async evaluateAnswer(question, correctAnswer, studentAnswer) {
    try {
      if (!studentAnswer || studentAnswer.trim().length === 0) {
        return {
          score: 0,
          feedback: 'No answer provided.',
          confidence: 1.0
        };
      }

      const prompt = `Evaluate this student answer:

Question: ${question}
Correct Answer: ${correctAnswer}
Student Answer: ${studentAnswer}

Rate the student answer on a scale of 0-100 and provide constructive feedback.
Format your response as:
Score: [0-100]
Feedback: [Your feedback here]`;

      const response = await this.hf.textGeneration({
        model: this.gradingModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.3
        }
      });

      return this.parseEvaluationResponse(response.generated_text);
    } catch (error) {
      console.error('Error in AI evaluation:', error);
      return this.fallbackEvaluation(correctAnswer, studentAnswer);
    }
  }

  // Parse AI evaluation response
  parseEvaluationResponse(text) {
    try {
      const lines = text.split('\n');
      let score = 0;
      let feedback = 'Unable to evaluate answer.';

      for (const line of lines) {
        if (line.startsWith('Score:')) {
          score = parseInt(line.replace('Score:', '').trim()) || 0;
        } else if (line.startsWith('Feedback:')) {
          feedback = line.replace('Feedback:', '').trim();
        }
      }

      return {
        score: Math.max(0, Math.min(100, score)),
        feedback: feedback,
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error parsing evaluation:', error);
      return {
        score: 0,
        feedback: 'Error in evaluation.',
        confidence: 0.1
      };
    }
  }

  // Fallback evaluation when AI fails
  fallbackEvaluation(correctAnswer, studentAnswer) {
    const similarity = this.calculateSimilarity(
      correctAnswer.toLowerCase(),
      studentAnswer.toLowerCase()
    );

    let score = Math.round(similarity * 100);
    let feedback = '';

    if (score >= 80) {
      feedback = 'Excellent answer! Very close to the expected response.';
    } else if (score >= 60) {
      feedback = 'Good answer, but could be more complete or accurate.';
    } else if (score >= 40) {
      feedback = 'Partially correct, but missing key elements.';
    } else {
      feedback = 'Answer needs significant improvement. Please review the material.';
    }

    return {
      score: score,
      feedback: feedback,
      confidence: 0.6
    };
  }

  // Simple similarity calculation
  calculateSimilarity(text1, text2) {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  // Get available subjects/topics
  getAvailableTopics() {
    return [
      { id: 'mathematics', name: 'Mathematics', description: 'Algebra, Geometry, Calculus' },
      { id: 'science', name: 'Science', description: 'Physics, Chemistry, Biology' },
      { id: 'history', name: 'History', description: 'World History, Rwanda History' },
      { id: 'geography', name: 'Geography', description: 'Physical and Human Geography' },
      { id: 'english', name: 'English', description: 'Grammar, Literature, Writing' },
      { id: 'kinyarwanda', name: 'Kinyarwanda', description: 'Rwandan Language and Culture' },
      { id: 'computer_science', name: 'Computer Science', description: 'Programming, Algorithms' },
      { id: 'economics', name: 'Economics', description: 'Micro and Macro Economics' }
    ];
  }

  // Check if Hugging Face API is available
  async checkAPIHealth() {
    try {
      const response = await this.hf.textGeneration({
        model: 'gpt2',
        inputs: 'Test',
        parameters: { max_new_tokens: 5 }
      });
      return { status: 'healthy', message: 'AI service is working' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

module.exports = new AIService();