import { Question } from '../types';

export const parseAnswerFile = (content: string): Omit<Question, 'score' | 'feedback' | 'gradedAt'>[] => {
  console.log('Parsing file content...');
  
  if (!content || content.trim().length === 0) {
    throw new Error('File is empty or contains no readable content');
  }
  
  const sections = content.split('---').filter(section => section.trim());
  console.log('Found sections:', sections.length);
  
  const questions: Omit<Question, 'score' | 'feedback' | 'gradedAt'>[] = [];

  sections.forEach((section, index) => {
    console.log(`Processing section ${index + 1}:`, section.substring(0, 100));
    
    const lines = section.split('\n').filter(line => line.trim());
    let question = '';
    let correctAnswer = '';
    let studentAnswer = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('Q:')) {
        question = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('A:')) {
        correctAnswer = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('S:')) {
        studentAnswer = trimmed.substring(2).trim();
      }
    });

    console.log(`Section ${index + 1} parsed:`, { question: question.substring(0, 50), correctAnswer: correctAnswer.substring(0, 50), studentAnswer: studentAnswer.substring(0, 50) });
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
        hasStudentAnswer: !!studentAnswer 
      });
    }
  });

  console.log('Total valid questions parsed:', questions.length);
  return questions;
};