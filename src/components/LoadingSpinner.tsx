import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Processing...' }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-lg font-semibold text-gray-700">{message}</p>
        <p className="text-gray-500">Please wait while we grade the answers...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;