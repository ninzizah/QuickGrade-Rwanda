import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TakePaper from './pages/TakePaper';
import CreatePaper from './pages/CreatePaper';
import ViewSubmissions from './pages/ViewSubmissions';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'student' && <StudentDashboard />}
              {user?.role === 'lecturer' && <LecturerDashboard />}
              {user?.role === 'admin' && <AdminDashboard />}
            </ProtectedRoute>
          } />
          
          <Route path="/take-paper/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <TakePaper />
            </ProtectedRoute>
          } />
          
          <Route path="/create-paper" element={
            <ProtectedRoute allowedRoles={['lecturer']}>
              <CreatePaper />
            </ProtectedRoute>
          } />
          
          <Route path="/submissions/:paperId" element={
            <ProtectedRoute allowedRoles={['lecturer']}>
              <ViewSubmissions />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;