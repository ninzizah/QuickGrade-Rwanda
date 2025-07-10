import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  index: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <span className="text-blue-600 font-bold">Q{index + 1}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Question {index + 1}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getScoreIcon(question.score)}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(question.score)}`}>
            {question.score}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Question:</p>
          <p className="text-gray-800 bg-gray-50 rounded-lg p-3">{question.question}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Correct Answer:</p>
          <p className="text-gray-800 bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
            {question.correctAnswer}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Student Answer:</p>
          <p className="text-gray-800 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
            {question.studentAnswer}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">AI Feedback:</p>
          <p className={`rounded-lg p-3 ${getScoreColor(question.score)}`}>
            {question.feedback}
          </p>
        </div>

        <div className="flex items-center text-sm text-gray-500 pt-2 border-t">
          <Clock className="h-4 w-4 mr-1" />
          <span>Graded at {question.gradedAt.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;