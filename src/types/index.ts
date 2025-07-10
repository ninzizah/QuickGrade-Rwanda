export interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  studentAnswer: string;
  score: number;
  feedback: string;
  gradedAt: Date;
}

export interface GradingResult {
  score: number;
  feedback: string;
  confidence: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  questions: Question[];
  uploadedAt: Date;
  totalQuestions: number;
  gradedQuestions: number;
}