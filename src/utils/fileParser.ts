import { Question } from '../types';

export const parseAnswerFile = (content: string): Omit<Question, 'score' | 'feedback' | 'gradedAt'>[] => {
  const sections = content.split('---').filter(section => section.trim());
  const questions: Omit<Question, 'score' | 'feedback' | 'gradedAt'>[] = [];

  sections.forEach((section, index) => {
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

    if (question && correctAnswer && studentAnswer) {
      questions.push({
        id: `q-${index + 1}`,
        question,
        correctAnswer,
        studentAnswer
      });
    }
  });

  return questions;
};