import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (content: string, fileName: string) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content, file.name);
    };
    reader.readAsText(file);
  }, [onFileUpload]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="text-center">
        <div className="bg-blue-50 rounded-full p-4 inline-block mb-4">
          <Upload className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Answer Sheet</h2>
        <p className="text-gray-600 mb-6">
          Upload a text file containing questions and student answers
        </p>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-semibold text-amber-800">Expected Format:</p>
              <p className="text-sm text-amber-700 mt-1">
                Q: [Question text]<br />
                A: [Correct answer]<br />
                S: [Student answer]<br />
                ---<br />
                (Repeat for each question)
              </p>
            </div>
          </div>
        </div>

        <label className="relative">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="hidden"
          />
          <div className={`
            border-2 border-dashed border-blue-300 rounded-lg p-8 
            hover:border-blue-400 hover:bg-blue-50 transition-all duration-200
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}>
            <FileText className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {isLoading ? 'Processing...' : 'Click to upload text file'}
            </p>
            <p className="text-gray-500">
              Supports .txt files with question-answer pairs
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default FileUploader;