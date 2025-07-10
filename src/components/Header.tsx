import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-4">
          <GraduationCap className="h-12 w-12 mr-3" />
          <h1 className="text-4xl font-bold">QuickGrade-Rwanda</h1>
          <Sparkles className="h-8 w-8 ml-3 text-yellow-300" />
        </div>
        <p className="text-xl text-center text-blue-100">
          AI-Powered Homework Grader for Rwandan Schools
        </p>
        <p className="text-center text-blue-200 mt-2">
          Empowering Rwandan educators with AI-assisted grading
        </p>
      </div>
    </header>
  );
};

export default Header;