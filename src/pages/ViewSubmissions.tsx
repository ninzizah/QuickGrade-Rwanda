import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Users, BarChart3, Download, Eye, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Submission {
  _id: string;
  student: {
    name: string;
    email: string;
    studentId?: string;
    department?: string;
  };
  totalScore: number;
  percentage: number;
  timeSpent: number;
  submittedAt: string;
  attemptNumber: number;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    points: number;
  }[];
}

interface Paper {
  _id: string;
  title: string;
  totalPoints: number;
  questions: any[];
}

const ViewSubmissions: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [submissionsRes, paperRes] = await Promise.all([
          axios.get(`/submissions/paper/${paperId}`),
          axios.get(`/papers/${paperId}`)
        ]);
        
        setSubmissions(submissionsRes.data);
        setPaper(paperRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    if (paperId) {
      fetchData();
    }
  }, [paperId]);

  if (loading) {
    return <LoadingSpinner message="Loading submissions..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!paper) {
    return <div>Paper not found</div>;
  }

  const averageScore = submissions.length > 0 
    ? submissions.reduce((sum, sub) => sum + sub.percentage, 0) / submissions.length 
    : 0;

  const passRate = submissions.length > 0 
    ? (submissions.filter(sub => sub.percentage >= 60).length / submissions.length) * 100 
    : 0;

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Student ID', 'Department', 'Score', 'Percentage', 'Time Spent (min)', 'Submitted At', 'Attempt'];
    const csvData = submissions.map(sub => [
      sub.student.name,
      sub.student.email,
      sub.student.studentId || '',
      sub.student.department || '',
      sub.totalScore,
      sub.percentage,
      sub.timeSpent,
      new Date(sub.submittedAt).toLocaleString(),
      sub.attemptNumber
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title}_submissions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{paper.title}</h1>
            <p className="text-gray-600">Submission Results</p>
          </div>
          
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
              <p className="text-sm text-gray-600">Total Submissions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">{averageScore.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{passRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Pass Rate (≥60%)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{paper.totalPoints}</p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Submissions</h2>
        
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No submissions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {submission.student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.student.email}
                        </div>
                        {submission.student.studentId && (
                          <div className="text-xs text-gray-400">
                            ID: {submission.student.studentId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className={`text-sm font-medium ${
                            submission.percentage >= 80 ? 'text-green-600' :
                            submission.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {submission.percentage}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {submission.totalScore}/{paper.totalPoints} points
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.timeSpent} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        #{submission.attemptNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Submission Details - {selectedSubmission.student.name}
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedSubmission.percentage}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedSubmission.timeSpent} min
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedSubmission.answers.map((answer, index) => {
                const question = paper.questions[index];
                const selectedOption = question?.options[answer.selectedOption];
                
                return (
                  <div key={index} className="border border-gray-200 rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <span className={`px-2 py-1 rounded text-sm ${
                        answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{question?.question}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Student Answer:</strong> {selectedOption?.text || 'No answer'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Points:</strong> {answer.points}/{question?.points || 0}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSubmissions;