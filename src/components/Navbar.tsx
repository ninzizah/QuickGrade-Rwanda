import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, LogOut, User, Plus, BarChart3 } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">MCQ System</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user.role === 'lecturer' && (
              <Link
                to="/create-paper"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Paper</span>
              </Link>
            )}

            {user.role === 'admin' && (
              <Link
                to="/"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* User Info */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
              <span className="text-xs text-gray-500 capitalize">({user.role})</span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;