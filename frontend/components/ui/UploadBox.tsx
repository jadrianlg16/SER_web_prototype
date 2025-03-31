// import React, { useState } from 'react';

// interface UploadBoxProps {
//   onUpload: (file: File) => void;
// }

// const UploadBox: React.FC<UploadBoxProps> = ({ onUpload }) => {
//   const [isDragging, setIsDragging] = useState(false);
  
//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };
  
//   const handleDragLeave = () => {
//     setIsDragging(false);
//   };
  
//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       onUpload(e.dataTransfer.files[0]);
//     }
//   };
  
//   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       onUpload(e.target.files[0]);
//     }
//   };
  
//   return (
//     <div 
//       className={`
//         w-full h-72 border-2 border-dashed rounded-lg flex flex-col items-center justify-center
//         ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}
//       `}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//       onClick={() => document.getElementById('fileInput')?.click()}
//     >
//       <div className="text-purple-500 mb-4">
//         <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
//           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h3l-4 4-4-4h3z" />
//         </svg>
//       </div>
//       <h3 className="text-2xl font-medium text-purple-500 mb-2">Analiza y Transcribe tu archivo</h3>
//       <p className="text-gray-500">Arrastra o haz click para cargar</p>
      
//       <input 
//         type="file" 
//         id="fileInput" 
//         className="hidden" 
//         onChange={handleFileInput} 
//         accept="audio/*,video/*"
//       />
//     </div>
//   );
// };

// export default UploadBox;


import React, { useState } from 'react';

interface UploadBoxProps {
  onFileChange: (file: File) => void;
  onUpload: () => void;
  uploading: boolean;
  file: File | null;
}

const UploadBox: React.FC<UploadBoxProps> = ({ onFileChange, onUpload, uploading, file }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div 
        className={`
          w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-200'}
          hover:bg-indigo-50 transition-colors cursor-pointer
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <div className="text-indigo-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-indigo-500 mb-2">Select or drop audio file</h3>
        {file ? (
          <span className="text-sm text-gray-500">
            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </span>
        ) : (
          <p className="text-gray-500">Click or drag to upload an audio file</p>
        )}
        
        <input 
          type="file" 
          id="fileInput" 
          className="hidden" 
          onChange={handleFileInput} 
          accept="audio/*,video/*"
        />
      </div>
      
      <button
        onClick={onUpload}
        disabled={uploading || !file}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {uploading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </div>
        ) : (
          'Analyze Recording'
        )}
      </button>
    </div>
  );
};

export default UploadBox;