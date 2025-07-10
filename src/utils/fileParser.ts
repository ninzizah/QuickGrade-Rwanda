import { Question } from '../types';

export const parseAnswerFile = (content: string): Omit<Question, 'score' | 'feedback' | 'gradedAt'>[] => {
  console.log('Parsing file content...');
  
  if (!content || content.trim().length === 0) {
    throw new Error('File is empty or contains no readable content');
  }
  
  // Try different section separators
  let sections = content.split('---').filter(section => section.trim());
  
  // If no sections found with ---, try splitting by double newlines
  if (sections.length <= 1) {
    sections = content.split('\n\n').filter(section => section.trim());
  }
  
  // If still no sections, treat the entire content as one section
  if (sections.length <= 1) {
    sections = [content];
  }
  
  console.log('Found sections:', sections.length);
  
  const questions: Omit<Question, 'score' | 'feedback' | 'gradedAt'>[] = [];

  sections.forEach((section, index) => {
    console.log(`Processing section ${index + 1}:`, section.substring(0, 100));
    
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    let question = '';
    let correctAnswer = '';
    let studentAnswer = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      // More flexible parsing - handle different formats
      if (trimmed.match(/^Q[:\.]?\s*/i)) {
        question = trimmed.replace(/^Q[:\.]?\s*/i, '').trim();
      } else if (trimmed.match(/^A[:\.]?\s*/i)) {
        correctAnswer = trimmed.replace(/^A[:\.]?\s*/i, '').trim();
      } else if (trimmed.match(/^S[:\.]?\s*/i)) {
        studentAnswer = trimmed.replace(/^S[:\.]?\s*/i, '').trim();
      } else if (trimmed.match(/^(Question|Correct Answer|Student Answer)[:\.]?\s*/i)) {
        // Handle full word prefixes
        if (trimmed.match(/^Question[:\.]?\s*/i)) {
          question = trimmed.replace(/^Question[:\.]?\s*/i, '').trim();
        } else if (trimmed.match(/^Correct Answer[:\.]?\s*/i)) {
          correctAnswer = trimmed.replace(/^Correct Answer[:\.]?\s*/i, '').trim();
        } else if (trimmed.match(/^Student Answer[:\.]?\s*/i)) {
          studentAnswer = trimmed.replace(/^Student Answer[:\.]?\s*/i, '').trim();
        }
      }
    });

    console.log(`Section ${index + 1} parsed:`, { 
      question: question.substring(0, 50), 
      correctAnswer: correctAnswer.substring(0, 50), 
      studentAnswer: studentAnswer.substring(0, 50) 
    });

    if (question && correctAnswer && studentAnswer) {
      questions.push({
        id: `q-${index + 1}`,
        question,
        correctAnswer,
        studentAnswer
      });
    } else {
      console.warn(`Section ${index + 1} missing required fields:`, { 
        hasQuestion: !!question, 
        hasCorrectAnswer: !!correctAnswer, 
        hasStudentAnswer: !!studentAnswer,
        sectionContent: section.substring(0, 200)
      });
    }
  });

  console.log('Total valid questions parsed:', questions.length);
  
  // Improved error handling as suggested
  if (sections.length > 0 && questions.length === 0) {
    throw new Error(`Found ${sections.length} section(s) in the file, but no valid question sets could be extracted. Please ensure each section contains:
    
Q: [Your question]
A: [Correct answer]  
S: [Student answer]

Sections should be separated by '---' or double line breaks.`);
  }
  
  if (questions.length === 0) {
    throw new Error('No valid questions found in the file. Please check the format.');
  }

  return questions;
};