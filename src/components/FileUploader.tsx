import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (content: string, fileName: string) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Check if it's a text file
    if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
      alert('Please select a text (.txt) file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      console.log('File content loaded:', content.substring(0, 100) + '...');
      onFileUpload(content, file.name);
    };
    
    reader.onerror = (e) => {
      console.error('Error reading file:', e);
      alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
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

        <div className="relative">
          <input
            id="file-upload"
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <label htmlFor="file-upload" className={`
            block
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
          </label>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            You can also try the sample file: 
            <button 
              onClick={() => {
                // Load the sample file content
                fetch('/sample-answers.txt')
                  .then(response => response.text())
                  .then(content => {
                    console.log('Sample file loaded');
                    onFileUpload(content, 'sample-answers.txt');
                  })
                  .catch(error => {
                    console.error('Error loading sample file:', error);
                    onFileUpload(sampleContent, 'sample-answers.txt');
                  });
              }}
              className="text-blue-600 hover:text-blue-800 underline ml-1"
              disabled={isLoading}
            >
              Load Sample File
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;