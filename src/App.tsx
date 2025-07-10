import React, { useState } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import LoadingSpinner from './components/LoadingSpinner';
import GradingResults from './components/GradingResults';
import { Question } from './types';
import { parseAnswerFile } from './utils/fileParser';
import aiGrader from './services/aiGrader';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (content: string, fileName: string) => {
    setIsLoading(true);
    setFileName(fileName);
    
    try {
      const parsedQuestions = parseAnswerFile(content);
      const gradedQuestions: Question[] = [];

      // Grade each question
      for (const parsedQuestion of parsedQuestions) {
        const gradingResult = await aiGrader.gradeAnswer(
          parsedQuestion.question,
          parsedQuestion.correctAnswer,
          parsedQuestion.studentAnswer
        );

        gradedQuestions.push({
          ...parsedQuestion,
          score: gradingResult.score,
          feedback: gradingResult.feedback,
          gradedAt: new Date()
        });
      }

      setQuestions(gradedQuestions);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewFile = () => {
    setQuestions([]);
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {questions.length === 0 && !isLoading && (
          <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
        )}
        
        {isLoading && (
          <LoadingSpinner message="Grading answers with AI..." />
        )}
        
        {questions.length > 0 && !isLoading && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Grading Results</h2>
              <button
                onClick={handleNewFile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Grade New File
              </button>
            </div>
            <GradingResults questions={questions} fileName={fileName} />
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-300">
            QuickGrade-Rwanda - AI-Powered Homework Grader | Built for Rwandan Education
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Supporting Rwandan teachers and students
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;