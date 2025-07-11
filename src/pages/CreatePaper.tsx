import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, AlertCircle, Sparkles, Loader2, Lightbulb } from 'lucide-react';

interface Question {
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  points: number;
}

const CreatePaper: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 60,
    dueDate: '',
    allowedAttempts: 1
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      points: 1
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [aiConfig, setAiConfig] = useState({
    topic: '',
    difficulty: 'medium',
    count: 5
  });

  // Load available topics on component mount
  React.useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await axios.get('/api/ai/topics');
        setAvailableTopics(response.data);
      } catch (error) {
        console.error('Failed to load topics:', error);
      }
    };
    loadTopics();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (questionIndex: number, field: string, value: string | number) => {
    const updatedQuestions = [...questions];
    if (field === 'question' || field === 'points') {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value
      };
    }
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, field: string, value: string | boolean) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.forEach((option, index) => {
      option.isCorrect = index === optionIndex;
    });
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        points: 1
      }
    ]);
  };

  const removeQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== questionIndex));
    }
  };

  // Generate AI questions
  const generateAIQuestions = async () => {
    if (!aiConfig.topic) {
      setError('Please select a topic for AI question generation');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/ai/generate-questions', aiConfig);
      const aiQuestions = response.data.questions;
      
      // Add AI-generated questions to existing questions
      setQuestions([...questions, ...aiQuestions]);
      
      // Show success message
      alert(`Successfully generated ${aiQuestions.length} AI questions!`);
    } catch (error) {
      console.error('AI generation error:', error);
      setError(error.response?.data?.message || 'Failed to generate AI questions');
    } finally {
      setAiLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Paper title is required');
      return false;
    }

    if (!formData.dueDate) {
      setError('Due date is required');
      return false;
    }

    if (new Date(formData.dueDate) <= new Date()) {
      setError('Due date must be in the future');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.question.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }

      const hasCorrectAnswer = question.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        setError(`Question ${i + 1} must have a correct answer selected`);
        return false;
      }

      const emptyOptions = question.options.filter(option => !option.text.trim());
      if (emptyOptions.length > 0) {
        setError(`Question ${i + 1} has empty options`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await axios.post('/papers', {
        ...formData,
        questions
      });

      navigate('/', { 
        state: { message: 'Paper created successfully!' }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create paper');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Paper</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Question Generator */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-purple-800">AI Question Generator</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic *
              </label>
              <select
                value={aiConfig.topic}
                onChange={(e) => setAiConfig({...aiConfig, topic: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a topic</option>
                {availableTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={aiConfig.difficulty}
                onChange={(e) => setAiConfig({...aiConfig, difficulty: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={aiConfig.count}
                onChange={(e) => setAiConfig({...aiConfig, count: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={generateAIQuestions}
            disabled={aiLoading || !aiConfig.topic}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating AI Questions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Questions
              </>
            )}
          </button>

          <div className="mt-3 text-sm text-purple-600">
            <Lightbulb className="h-4 w-4 inline mr-1" />
            AI will generate high-quality multiple choice questions based on your selected topic and difficulty level.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Paper Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Paper Details</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Paper Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter paper title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter paper description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit (minutes) *
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  required
                  min="1"
                  value={formData.timeLimit}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  id="dueDate"
                  name="dueDate"
                  required
                  value={formData.dueDate}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="allowedAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Attempts *
                </label>
                <input
                  type="number"
                  id="allowedAttempts"
                  name="allowedAttempts"
                  required
                  min="1"
                  max="10"
                  value={formData.allowedAttempts}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>

            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-800">
                      Question {questionIndex + 1}
                    </h3>
                    {question.aiGenerated && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        AI Generated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Points:</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text *
                    </label>
                    <textarea
                      rows={2}
                      value={question.question}
                      onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options (select the correct answer)
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={option.isCorrect}
                            onChange={() => setCorrectAnswer(questionIndex, optionIndex)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? 'Creating...' : 'Create Paper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePaper;