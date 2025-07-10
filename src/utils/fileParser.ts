import { Question } from '../types';

export const parseAnswerFile = (content: string): Omit<Question, 'score' | 'feedback' | 'gradedAt'>[] => {
  console.log('Parsing file content...');
  
  if (!content || content.trim().length === 0) {
    throw new Error('File is empty or contains no readable content');
  }
  
  // Clean up the content
  const cleanContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Try different section separators
  let sections = cleanContent.split('---').filter(section => section.trim());
  
  // If no sections found with ---, try splitting by double newlines
  if (sections.length <= 1) {
    sections = cleanContent.split(/\n\s*\n/).filter(section => section.trim());
  }
  
  // If still no sections, try splitting by multiple dashes or equals
  if (sections.length <= 1) {
    sections = cleanContent.split(/[-=]{2,}/).filter(section => section.trim());
  }
  
  // If still no sections, try splitting by numbers (1., 2., etc.)
  if (sections.length <= 1) {
    sections = cleanContent.split(/\n\s*\d+\.\s*/).filter(section => section.trim());
  }
  
  console.log('Found sections:', sections.length);
  
  const questions: Omit<Question, 'score' | 'feedback' | 'gradedAt'>[] = [];

  sections.forEach((section, index) => {
    console.log(`Processing section ${index + 1}:`, section.substring(0, 200));
    
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    let question = '';
    let correctAnswer = '';
    let studentAnswer = '';

    // Try to extract question, correct answer, and student answer
    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      
      // Multiple patterns for questions
      if (trimmed.match(/^(Q[:\.]?\s*|Question[:\.]?\s*|\d+[:\.]?\s*|Query[:\.]?\s*)/i)) {
        question = trimmed.replace(/^(Q[:\.]?\s*|Question[:\.]?\s*|\d+[:\.]?\s*|Query[:\.]?\s*)/i, '').trim();
      }
      // Multiple patterns for correct answers
      else if (trimmed.match(/^(A[:\.]?\s*|Answer[:\.]?\s*|Correct[:\.]?\s*|Solution[:\.]?\s*)/i)) {
        correctAnswer = trimmed.replace(/^(A[:\.]?\s*|Answer[:\.]?\s*|Correct[:\.]?\s*|Solution[:\.]?\s*)/i, '').trim();
      }
      // Multiple patterns for student answers
      else if (trimmed.match(/^(S[:\.]?\s*|Student[:\.]?\s*|Response[:\.]?\s*|Reply[:\.]?\s*)/i)) {
        studentAnswer = trimmed.replace(/^(S[:\.]?\s*|Student[:\.]?\s*|Response[:\.]?\s*|Reply[:\.]?\s*)/i, '').trim();
      }
      // If no prefix found, try to infer based on position
      else if (!question && lineIndex === 0) {
        question = trimmed;
      } else if (!correctAnswer && lineIndex === 1) {
        correctAnswer = trimmed;
      } else if (!studentAnswer && lineIndex === 2) {
        studentAnswer = trimmed;
      }
      // Handle multi-line content
      else if (question && !correctAnswer && !trimmed.match(/^[A-Z][:\.]?\s*/)) {
        question += ' ' + trimmed;
      } else if (correctAnswer && !studentAnswer && !trimmed.match(/^[A-Z][:\.]?\s*/)) {
        correctAnswer += ' ' + trimmed;
      } else if (studentAnswer && !trimmed.match(/^[A-Z][:\.]?\s*/)) {
        studentAnswer += ' ' + trimmed;
      }
    });

    console.log(`Section ${index + 1} parsed:`, { 
      question: question.substring(0, 100), 
      correctAnswer: correctAnswer.substring(0, 100), 
      studentAnswer: studentAnswer.substring(0, 100),
      hasAll: !!(question && correctAnswer && studentAnswer)
    });

    // More lenient validation - allow missing student answer
    if (question && correctAnswer) {
      questions.push({
        id: `q-${index + 1}`,
        question: question.trim(),
        correctAnswer: correctAnswer.trim(),
        studentAnswer: studentAnswer.trim() || 'No answer provided'
      });
    } else {
      console.warn(`Section ${index + 1} missing required fields:`, { 
        hasQuestion: !!question, 
        hasCorrectAnswer: !!correctAnswer, 
        hasStudentAnswer: !!studentAnswer,
        firstFewLines: lines.slice(0, 3)
      });
    }
  });

  console.log('Total valid questions parsed:', questions.length);
  
  // Show detailed error if no questions found
  if (questions.length === 0) {
    const sampleLines = cleanContent.split('\n').slice(0, 10);
    throw new Error(`Could not parse any questions from your file. 

Here's what I found in the first few lines:
${sampleLines.map((line, i) => `${i+1}: ${line}`).join('\n')}

The file should contain questions in one of these formats:

Format 1 (Preferred):
Q: What is the capital of France?
A: Paris
S: Paris
---

Format 2:
Question: What is 2+2?
Answer: 4
Student: 4

Format 3:
1. What is photosynthesis?
Photosynthesis is...
The student wrote...

Please check your file format and try again.`);
  }

  return questions;
};