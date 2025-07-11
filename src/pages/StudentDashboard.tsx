import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Clock, CheckCircle, AlertCircle, Calendar, Trophy } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Paper {
  _id: string;
  title: string;
  description: string;
  lecturer: {
    name: string;
    email: string;
  };
  timeLimit: number;
  totalPoints: number;
  dueDate: string;
  allowedAttempts: number;
  questions: any[];
}

interface Submission {
  _id: string;
  paper: {
    title: string;
    totalPoints: number;
  };
  totalScore: number;
  percentage: number;
  submittedAt: string;
  attemptNumber: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersRes, submissionsRes] = await Promise.all([
          axios.get('/papers'),
          axios.get('/submissions/my-submissions')
        ]);
        
        setPapers(papersRes.data);
        setSubmissions(submissionsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const getSubmissionCount = (paperId: string) => {
    return submissions.filter(sub => sub.paper._id === paperId).length;
  };

  const getLatestSubmission = (paperId: string) => {
    const paperSubmissions = submissions.filter(sub => sub.paper._id === paperId);
    return paperSubmissions.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )[0];
  };

  const averageScore = submissions.length > 0 
    ? submissions.reduce((sum, sub) => sum + sub.percentage, 0) / submissions.length 
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Ready to take some quizzes? Here are your available papers and recent submissions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{papers.length}</p>
              <p className="text-sm text-gray-600">Available Papers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">{submissions.length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{averageScore.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Available Papers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Papers</h2>
        
        {papers.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No papers available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {papers.map((paper) => {
              const submissionCount = getSubmissionCount(paper._id);
              const latestSubmission = getLatestSubmission(paper._id);
              const canTake = submissionCount < paper.allowedAttempts;
              const isExpired = new Date() > new Date(paper.dueDate);

              return (
                <div key={paper._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{paper.title}</h3>
                      <p className="text-gray-600 mb-2">{paper.description}</p>
                      <p className="text-sm text-gray-500">By: {paper.lecturer.name}</p>
                    </div>
                    
                    <div className="text-right">
                      {latestSubmission && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-green-600">
                            Latest: {latestSubmission.percentage}%
                          </span>
                        </div>
                      )}
                      
                      {canTake && !isExpired ? (
                        <Link
                          to={`/take-paper/${paper._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          {submissionCount > 0 ? 'Retake' : 'Take Paper'}
                        </Link>
                      ) : (
                        <span className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium">
                          {isExpired ? 'Expired' : 'Max Attempts'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{paper.timeLimit} minutes</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        <span>{paper.questions.length} questions</span>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1" />
                        <span>{paper.totalPoints} points</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {new Date(paper.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    Attempts: {submissionCount}/{paper.allowedAttempts}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Submissions */}
      {submissions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Submissions</h2>
          
          <div className="space-y-4">
            {submissions.slice(0, 5).map((submission) => (
              <div key={submission._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-800">{submission.paper.title}</h3>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Attempt #{submission.attemptNumber}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    submission.percentage >= 80 ? 'text-green-600' :
                    submission.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {submission.percentage}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {submission.totalScore}/{submission.paper.totalPoints} points
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;