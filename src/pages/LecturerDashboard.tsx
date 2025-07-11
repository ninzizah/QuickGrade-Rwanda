import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, BookOpen, Users, BarChart3, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Paper {
  _id: string;
  title: string;
  description: string;
  questions: any[];
  timeLimit: number;
  totalPoints: number;
  dueDate: string;
  allowedAttempts: number;
  isActive: boolean;
  createdAt: string;
}

const LecturerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get('/papers');
        setPapers(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load papers');
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  const handleDeletePaper = async (paperId: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;

    try {
      await axios.delete(`/papers/${paperId}`);
      setPapers(papers.filter(paper => paper._id !== paperId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete paper');
    }
  };

  const togglePaperStatus = async (paperId: string) => {
    try {
      const paper = papers.find(p => p._id === paperId);
      if (!paper) return;

      const response = await axios.put(`/papers/${paperId}`, {
        isActive: !paper.isActive
      });

      setPapers(papers.map(p => 
        p._id === paperId ? response.data.paper : p
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update paper status');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your papers..." />;
  }

  const activePapers = papers.filter(p => p.isActive).length;
  const totalQuestions = papers.reduce((sum, p) => sum + p.questions.length, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Lecturer Dashboard 📚
            </h1>
            <p className="text-gray-600">
              Manage your papers, create new assessments, and track student performance.
            </p>
          </div>
          
          <Link
            to="/create-paper"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Paper</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{papers.length}</p>
              <p className="text-sm text-gray-600">Total Papers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">{activePapers}</p>
              <p className="text-sm text-gray-600">Active Papers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{totalQuestions}</p>
              <p className="text-sm text-gray-600">Total Questions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {papers.filter(p => new Date(p.dueDate) > new Date()).length}
              </p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Papers List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Papers</h2>
        
        {papers.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't created any papers yet.</p>
            <Link
              to="/create-paper"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Your First Paper
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {papers.map((paper) => (
              <div key={paper._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{paper.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        paper.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {paper.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{paper.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{paper.questions.length} questions</span>
                      <span>{paper.timeLimit} minutes</span>
                      <span>{paper.totalPoints} points</span>
                      <span>Max {paper.allowedAttempts} attempts</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/submissions/${paper._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Submissions"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    
                    <button
                      onClick={() => togglePaperStatus(paper._id)}
                      className={`p-2 rounded-md transition-colors ${
                        paper.isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={paper.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeletePaper(paper._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Paper"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Due: {new Date(paper.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    Created: {new Date(paper.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerDashboard;