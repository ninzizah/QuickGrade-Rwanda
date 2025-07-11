import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Question {
  _id: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  points: number;
}

interface Paper {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  totalPoints: number;
  dueDate: string;
  allowedAttempts: number;
}

const TakePaper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await axios.get(`/papers/${id}`);
        setPaper(response.data);
        setTimeLeft(response.data.timeLimit * 60); // Convert to seconds
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load paper');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaper();
    }
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (!started || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = async () => {
    if (!paper) return;

    setSubmitting(true);
    try {
      const submissionAnswers = paper.questions.map((_, index) => ({
        selectedOption: answers[index] ?? -1
      }));

      const timeSpent = Math.round((paper.timeLimit * 60 - timeLeft) / 60);

      await axios.post('/submissions', {
        paperId: paper._id,
        answers: submissionAnswers,
        timeSpent
      });

      navigate('/', { 
        state: { message: 'Paper submitted successfully!' }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit paper');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return <LoadingSpinner message="Loading paper..." />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return <div>Paper not found</div>;
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{paper.title}</h1>
          <p className="text-gray-600 mb-6">{paper.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Time Limit</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{paper.timeLimit} minutes</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium">Questions</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{paper.questions.length}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Instructions</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>You have {paper.timeLimit} minutes to complete this paper</li>
                    <li>Select one answer for each question</li>
                    <li>You can navigate between questions using the navigation buttons</li>
                    <li>The paper will auto-submit when time runs out</li>
                    <li>Make sure to submit before the timer expires</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium text-lg transition-colors"
          >
            Start Paper
          </button>
        </div>
      </div>
    );
  }

  const currentQ = paper.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with timer */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{paper.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {paper.questions.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Answered</p>
              <p className="font-bold text-green-600">
                {getAnsweredCount()}/{paper.questions.length}
              </p>
            </div>
            
            <div className={`text-right ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
              <p className="text-sm">Time Left</p>
              <p className="text-2xl font-bold">
                <Clock className="inline h-5 w-5 mr-1" />
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Question {currentQuestion + 1}
            </h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
              {currentQ.points} {currentQ.points === 1 ? 'point' : 'points'}
            </span>
          </div>
          <p className="text-gray-700 text-lg">{currentQ.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, optionIndex) => (
            <label
              key={optionIndex}
              className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                answers[currentQuestion] === optionIndex
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={optionIndex}
                  checked={answers[currentQuestion] === optionIndex}
                  onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-gray-700">{option.text}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {paper.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === paper.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Paper'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(paper.questions.length - 1, currentQuestion + 1))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakePaper;