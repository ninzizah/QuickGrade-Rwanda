import React from 'react';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';
import { Question } from '../types';
import QuestionCard from './QuestionCard';

interface GradingResultsProps {
  questions: Question[];
  fileName: string;
}

const GradingResults: React.FC<GradingResultsProps> = ({ questions, fileName }) => {
  const totalQuestions = questions.length;
  const averageScore = questions.reduce((sum, q) => sum + q.score, 0) / totalQuestions;
  const passedQuestions = questions.filter(q => q.score >= 60).length;
  const excellentQuestions = questions.filter(q => q.score >= 80).length;

  const getGradeColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLetter = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Grading Summary</h2>
        </div>
        
        <div className="mb-4">
          <p className="text-lg text-gray-600">File: <span className="font-semibold text-gray-800">{fileName}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                <p className="text-sm text-blue-600">Total Questions</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${getGradeColor(averageScore)}`}>
                  {averageScore.toFixed(1)}%
                </p>
                <p className="text-sm text-green-600">Average Score</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{passedQuestions}</p>
                <p className="text-sm text-yellow-600">Passed (≥60%)</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{excellentQuestions}</p>
                <p className="text-sm text-purple-600">Excellent (≥80%)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-700">Overall Grade:</span>
            <div className="flex items-center space-x-2">
              <span className={`text-3xl font-bold ${getGradeColor(averageScore)}`}>
                {getGradeLetter(averageScore)}
              </span>
              <span className={`text-xl ${getGradeColor(averageScore)}`}>
                ({averageScore.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Question Results */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Individual Question Results</h3>
        {questions.map((question, index) => (
          <QuestionCard key={question.id} question={question} index={index} />
        ))}
      </div>
    </div>
  );
};

export default GradingResults;