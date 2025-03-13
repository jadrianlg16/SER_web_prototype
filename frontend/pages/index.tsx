// // 'use client'
// // import React, { useState } from 'react';

// // interface Aspect {
// //   text: string;
// //   sentiment: string;
// //   scores?: {
// //     [key: string]: number;
// //   };
// // }

// // interface TranscriptData {
// //   id: number;
// //   transcript: string;
// //   summary: string;
// //   emotion: string;
// //   aspects?: Aspect[];  // add the aspects field
// // }

// // interface ChatMessage {
// //   role: 'user' | 'assistant' | 'system';
// //   content: string;
// // }

// // export default function Home() {
// //   // ---------------------------
// //   // State for uploading & results
// //   // ---------------------------
// //   const [audioFile, setAudioFile] = useState<File | null>(null);
// //   const [uploading, setUploading] = useState<boolean>(false);
// //   const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);

// //   // ---------------------------
// //   // State for chat
// //   // ---------------------------
// //   const [messages, setMessages] = useState<ChatMessage[]>([]);
// //   const [userInput, setUserInput] = useState<string>('');
// //   const [showChat, setShowChat] = useState<boolean>(false);
// //   const [chatLoading, setChatLoading] = useState<boolean>(false);

// //   // ---------------------------
// //   // Handle file selection
// //   // ---------------------------
// //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (e.target.files && e.target.files.length > 0) {
// //       setAudioFile(e.target.files[0]);
// //     }
// //   };

// //   // ---------------------------
// //   // Upload the audio
// //   // ---------------------------
// //   const handleUpload = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!audioFile) {
// //       alert('Please select an audio file first.');
// //       return;
// //     }

// //     try {
// //       setUploading(true);
// //       setTranscriptData(null); // reset old data
// //       // Create FormData
// //       const formData = new FormData();
// //       formData.append('file', audioFile);

// //       const response = await fetch('http://localhost:8000/upload', {
// //         method: 'POST',
// //         body: formData,
// //       });

// //       if (!response.ok) {
// //         throw new Error(`Upload failed with status ${response.status}`);
// //       }

// //       const data = await response.json();
// //       /*
// //         data should look like:
// //         {
// //           id: number,
// //           transcript: string,
// //           summary: string,
// //           emotion: string,
// //           aspects: [{ text, sentiment, scores }, ...]
// //         }
// //       */
// //       setTranscriptData(data);
// //     } catch (err) {
// //       console.error('Error uploading file:', err);
// //       alert('Something went wrong. Check the console for details.');
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   // ---------------------------
// //   // Open the chat panel
// //   // ---------------------------
// //   const handleOpenChat = () => {
// //     if (!transcriptData) {
// //       alert('No transcript data yet. Please upload an audio file first.');
// //       return;
// //     }
// //     // Clear old chat messages
// //     setMessages([]);
// //     setUserInput('');
// //     setShowChat(true);
// //   };

// //   // ---------------------------
// //   // Send a chat message
// //   // ---------------------------
// //   const handleSendChatMessage = async () => {
// //     if (!transcriptData) {
// //       alert('No transcript to reference. Upload a file first.');
// //       return;
// //     }
// //     if (!userInput.trim()) return;

// //     // Add user's message to local state
// //     const userMsg: ChatMessage = {
// //       role: 'user',
// //       content: userInput.trim(),
// //     };

// //     const updatedMessages = [...messages, userMsg];
// //     setMessages(updatedMessages);
// //     setUserInput('');

// //     // Call /chat on your FastAPI backend
// //     try {
// //       setChatLoading(true);
// //       const response = await fetch('http://localhost:8000/chat', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           transcript_id: transcriptData.id,
// //           messages: updatedMessages, // send entire conversation
// //         }),
// //       });

// //       if (!response.ok) {
// //         throw new Error(`Chat request failed with status ${response.status}`);
// //       }

// //       const data = await response.json();

// //       if (data.error) {
// //         // Error from backend
// //         const errorMsg: ChatMessage = {
// //           role: 'assistant',
// //           content: `Error: ${data.error}`,
// //         };
// //         setMessages((prev) => [...prev, errorMsg]);
// //       } else {
// //         // Success
// //         const assistantMsg: ChatMessage = {
// //           role: 'assistant',
// //           content: data.assistant_message || 'No response',
// //         };
// //         setMessages((prev) => [...prev, assistantMsg]);
// //       }
// //     } catch (err) {
// //       console.error('Chat error:', err);
// //       const errorMsg: ChatMessage = {
// //         role: 'assistant',
// //         content: `Error: ${err}`,
// //       };
// //       setMessages((prev) => [...prev, errorMsg]);
// //     } finally {
// //       setChatLoading(false);
// //     }
// //   };

// //   // ---------------------------
// //   // Render
// //   // ---------------------------
// //   return (
// //     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
// //       <h1 className="text-2xl font-bold mb-4">Audio Transcription &amp; Analysis</h1>

// //       {/* UPLOAD FORM */}
// //       <form onSubmit={handleUpload} className="bg-white rounded shadow p-4 w-full max-w-md">
// //         <div className="mb-4">
// //           <label className="block text-gray-700 mb-2" htmlFor="audio-file">
// //             Upload an audio file:
// //           </label>
// //           <input
// //             id="audio-file"
// //             type="file"
// //             accept="audio/*"
// //             onChange={handleFileChange}
// //             className="block w-full text-sm text-gray-500
// //              file:mr-4 file:py-2 file:px-4
// //              file:rounded-full file:border-0
// //              file:text-sm file:font-semibold
// //              file:bg-indigo-50 file:text-indigo-700
// //              hover:file:bg-indigo-100"
// //           />
// //         </div>
// //         <button
// //           type="submit"
// //           disabled={uploading}
// //           className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
// //         >
// //           {uploading ? 'Processing...' : 'Upload'}
// //         </button>
// //       </form>

// //       {/* CALL REPORT & TRANSCRIPT RESULTS */}
// //       {transcriptData && (
// //         <div className="bg-white rounded shadow p-4 mt-4 w-full max-w-2xl">
// //           <h2 className="text-xl font-bold mb-2">Call Report</h2>

// //           {/* Overall Emotion */}
// //           <div className="mb-4">
// //             <h3 className="text-lg font-semibold">Overall Emotion:</h3>
// //             <p className="text-gray-800">{transcriptData.emotion}</p>
// //           </div>

// //           {/* LLM Summary */}
// //           <div className="mb-4">
// //             <h3 className="text-lg font-semibold">LLM Summary:</h3>
// //             <p className="text-gray-800 whitespace-pre-wrap">{transcriptData.summary}</p>
// //           </div>

// //           {/* Key Phrases / Aspects from OCI */}
// //           {transcriptData.aspects && transcriptData.aspects.length > 0 && (
// //             <div className="mb-4">
// //               <h3 className="text-lg font-semibold">Key Phrases Detected:</h3>
// //               <ul className="list-disc ml-6">
// //                 {transcriptData.aspects.map((aspect, idx) => {
// //                   // Simple color coding by sentiment
// //                   let sentimentColor = 'text-gray-800';
// //                   if (aspect.sentiment === 'Positive') sentimentColor = 'text-green-600';
// //                   else if (aspect.sentiment === 'Negative') sentimentColor = 'text-red-600';
// //                   else if (aspect.sentiment === 'Mixed') sentimentColor = 'text-yellow-600';

// //                   return (
// //                     <li key={idx} className={`mb-1 ${sentimentColor}`}>
// //                       <span className="font-semibold">{aspect.text}</span> – {aspect.sentiment}
// //                     </li>
// //                   );
// //                 })}
// //               </ul>
// //             </div>
// //           )}

// //           {/* Full Transcript */}
// //           <div className="mb-4">
// //             <h3 className="text-lg font-semibold">Full Transcript:</h3>
// //             <p className="text-gray-800 whitespace-pre-wrap">{transcriptData.transcript}</p>
// //           </div>

// //           {/* Open Chat Button */}
// //           <button
// //             onClick={handleOpenChat}
// //             className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
// //           >
// //             Chat about this transcript
// //           </button>
// //         </div>
// //       )}

// //       {/* CHAT PANEL */}
// //       {showChat && transcriptData && (
// //         <div className="bg-white rounded shadow p-4 mt-4 w-full max-w-2xl">
// //           <h2 className="text-xl font-semibold mb-2">Chat with LLM</h2>
// //           <div className="h-64 overflow-y-auto border p-2 mb-2">
// //             {messages.map((m, idx) => (
// //               <div
// //                 key={idx}
// //                 className={`my-1 p-2 rounded ${
// //                   m.role === 'assistant'
// //                     ? 'bg-blue-100 text-left'
// //                     : 'bg-gray-100 text-right'
// //                 }`}
// //               >
// //                 <strong>{m.role === 'assistant' ? 'Assistant' : 'You'}: </strong>
// //                 {m.content}
// //               </div>
// //             ))}
// //           </div>

// //           <div className="flex space-x-2">
// //             <input
// //               type="text"
// //               placeholder="Ask something about the transcript..."
// //               className="flex-1 border p-2"
// //               value={userInput}
// //               onChange={(e) => setUserInput(e.target.value)}
// //             />
// //             <button
// //               onClick={handleSendChatMessage}
// //               disabled={chatLoading}
// //               className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
// //             >
// //               {chatLoading ? 'Sending...' : 'Send'}
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }








// 'use client'
// import React, { useState } from 'react';

// interface Aspect {
//   text: string;
//   sentiment: string;
//   scores?: {
//     [key: string]: number;
//   };
// }

// interface TranscriptData {
//   id: number;
//   transcript: string;
//   summary: string;
//   emotion: string;
//   aspects?: Aspect[];
// }

// interface ChatMessage {
//   role: 'user' | 'assistant' | 'system';
//   content: string;
// }

// export default function Home() {
//   // State management
//   const [audioFile, setAudioFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [userInput, setUserInput] = useState<string>('');
//   const [showChat, setShowChat] = useState<boolean>(false);
//   const [chatLoading, setChatLoading] = useState<boolean>(false);
//   const [dragActive, setDragActive] = useState<boolean>(false);

//   // Handle file selection
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setAudioFile(e.target.files[0]);
//     }
//   };

//   // Handle drag events
//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   // Handle drop event
//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       setAudioFile(e.dataTransfer.files[0]);
//     }
//   };

//   // Upload the audio
//   const handleUpload = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!audioFile) {
//       alert('Please select an audio file first.');
//       return;
//     }

//     try {
//       setUploading(true);
//       setTranscriptData(null);
      
//       const formData = new FormData();
//       formData.append('file', audioFile);

//       const response = await fetch('http://localhost:8000/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`Upload failed with status ${response.status}`);
//       }

//       const data = await response.json();
//       setTranscriptData(data);
//     } catch (err) {
//       console.error('Error uploading file:', err);
//       alert('Something went wrong. Check the console for details.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Open the chat panel
//   const handleOpenChat = () => {
//     if (!transcriptData) {
//       alert('No transcript data yet. Please upload an audio file first.');
//       return;
//     }
//     setMessages([]);
//     setUserInput('');
//     setShowChat(true);
//   };

//   // Send a chat message
//   const handleSendChatMessage = async () => {
//     if (!transcriptData) {
//       alert('No transcript to reference. Upload a file first.');
//       return;
//     }
//     if (!userInput.trim()) return;

//     const userMsg: ChatMessage = {
//       role: 'user',
//       content: userInput.trim(),
//     };

//     const updatedMessages = [...messages, userMsg];
//     setMessages(updatedMessages);
//     setUserInput('');

//     try {
//       setChatLoading(true);
//       const response = await fetch('http://localhost:8000/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           transcript_id: transcriptData.id,
//           messages: updatedMessages,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Chat request failed with status ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.error) {
//         const errorMsg: ChatMessage = {
//           role: 'assistant',
//           content: `Error: ${data.error}`,
//         };
//         setMessages((prev) => [...prev, errorMsg]);
//       } else {
//         const assistantMsg: ChatMessage = {
//           role: 'assistant',
//           content: data.assistant_message || 'No response',
//         };
//         setMessages((prev) => [...prev, assistantMsg]);
//       }
//     } catch (err) {
//       console.error('Chat error:', err);
//       const errorMsg: ChatMessage = {
//         role: 'assistant',
//         content: `Error: ${err}`,
//       };
//       setMessages((prev) => [...prev, errorMsg]);
//     } finally {
//       setChatLoading(false);
//     }
//   };

//   // Handle key press for chat input
//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendChatMessage();
//     }
//   };

//   // Get emotion badge color
//   const getEmotionColor = (emotion: string) => {
//     switch(emotion.toLowerCase()) {
//       case 'happy':
//       case 'excited':
//       case 'positive':
//         return 'bg-green-100 text-green-800';
//       case 'sad':
//       case 'negative':
//       case 'angry':
//         return 'bg-red-100 text-red-800';
//       case 'neutral':
//         return 'bg-blue-100 text-blue-800';
//       case 'mixed':
//         return 'bg-yellow-100 text-yellow-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Header */}
//         <header className="text-center mb-10">
//           <h1 className="text-3xl font-bold text-indigo-800 mb-2">Audio Insight</h1>
//           <p className="text-gray-600">Transcribe, analyze, and chat about your audio recordings</p>
//         </header>

//         <div className="grid md:grid-cols-12 gap-6">
//           {/* Left column: Upload and controls */}
//           <div className="md:col-span-4 space-y-6">
//             {/* Upload form */}
//             <div 
//               className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${dragActive ? 'ring-2 ring-indigo-500 scale-102' : ''}`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//             >
//               <div className="p-6">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Recording</h2>
                
//                 <form onSubmit={handleUpload}>
//                   <div className="mb-6">
//                     <div className="border-2 border-dashed border-indigo-200 rounded-lg p-6 text-center cursor-pointer hover:bg-indigo-50 transition-colors">
//                       <input
//                         id="audio-file"
//                         type="file"
//                         accept="audio/*"
//                         onChange={handleFileChange}
//                         className="hidden"
//                       />
//                       <label htmlFor="audio-file" className="cursor-pointer">
//                         <div className="flex flex-col items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
//                           </svg>
//                           <span className="text-sm font-medium text-indigo-600">
//                             {audioFile ? audioFile.name : 'Click to select or drag audio file here'}
//                           </span>
//                           {audioFile && (
//                             <span className="text-xs text-gray-500 mt-1">
//                               {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
//                             </span>
//                           )}
//                         </div>
//                       </label>
//                     </div>
//                   </div>
                  
//                   <button
//                     type="submit"
//                     disabled={uploading || !audioFile}
//                     className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                   >
//                     {uploading ? (
//                       <div className="flex items-center justify-center">
//                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Processing...
//                       </div>
//                     ) : 'Analyze Recording'}
//                   </button>
//                 </form>
//               </div>
//             </div>

//             {/* Mini instructions card */}
//             <div className="bg-white rounded-xl shadow-md overflow-hidden">
//               <div className="p-6">
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">How it works</h3>
//                 <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
//                   <li>Upload your audio recording</li>
//                   <li>Review the transcript and analysis</li>
//                   <li>Chat with AI about the content</li>
//                 </ol>
//               </div>
//             </div>
//           </div>

//           {/* Right column: Results and chat */}
//           <div className="md:col-span-8 space-y-6">
//             {transcriptData ? (
//               <>
//                 {/* Results card */}
//                 <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                   <div className="border-b border-gray-100">
//                     <div className="flex items-center p-6">
//                       <div className="flex-grow">
//                         <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
//                       </div>
//                       {/* Emotion badge */}
//                       <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEmotionColor(transcriptData.emotion)}`}>
//                         {transcriptData.emotion}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="p-6">
//                     {/* Tabs */}
//                     <div className="border-b border-gray-200 mb-6">
//                       <nav className="-mb-px flex space-x-8" aria-label="Tabs">
//                         <button className="border-indigo-500 text-indigo-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
//                           Summary
//                         </button>
//                         <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
//                           Full Transcript
//                         </button>
//                       </nav>
//                     </div>

//                     {/* LLM Summary */}
//                     <div className="mb-6">
//                       <h3 className="text-lg font-medium text-gray-800 mb-2">Key Points</h3>
//                       <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
//                         {transcriptData.summary}
//                       </p>
//                     </div>

//                     {/* Key Phrases */}
//                     {transcriptData.aspects && transcriptData.aspects.length > 0 && (
//                       <div className="mb-6">
//                         <h3 className="text-lg font-medium text-gray-800 mb-3">Key Phrases</h3>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                           {transcriptData.aspects.map((aspect, idx) => {
//                             let sentimentColor = 'bg-gray-100 text-gray-800';
//                             if (aspect.sentiment === 'Positive') sentimentColor = 'bg-green-100 text-green-800 border-green-200';
//                             else if (aspect.sentiment === 'Negative') sentimentColor = 'bg-red-100 text-red-800 border-red-200';
//                             else if (aspect.sentiment === 'Mixed') sentimentColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
//                             else if (aspect.sentiment === 'Neutral') sentimentColor = 'bg-blue-100 text-blue-800 border-blue-200';

//                             return (
//                               <div key={idx} className={`p-3 rounded-lg border ${sentimentColor} text-sm`}>
//                                 <div className="font-medium">{aspect.text}</div>
//                                 <div className="text-xs mt-1 opacity-75">{aspect.sentiment}</div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     )}

//                     {/* Chat button */}
//                     <button
//                       onClick={handleOpenChat}
//                       className="mt-4 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
//                       </svg>
//                       <span>Ask questions about this recording</span>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Chat Panel */}
//                 {showChat && (
//                   <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                     <div className="p-6">
//                       <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat with AI Assistant</h2>
                      
//                       {/* Chat messages */}
//                       <div className="h-80 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
//                         {messages.length === 0 ? (
//                           <div className="text-center text-gray-500 py-10">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//                             </svg>
//                             <p>Ask a question about the recording to get started</p>
//                           </div>
//                         ) : (
//                           <div className="space-y-4">
//                             {messages.map((m, idx) => (
//                               <div
//                                 key={idx}
//                                 className={`p-3 rounded-lg max-w-3/4 ${
//                                   m.role === 'assistant' 
//                                     ? 'bg-indigo-50 text-left mr-auto' 
//                                     : 'bg-indigo-600 text-white ml-auto'
//                                 }`}
//                               >
//                                 <p className="text-sm whitespace-pre-wrap">{m.content}</p>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
                      
//                       {/* Chat input */}
//                       <div className="flex space-x-2">
//                         <input
//                           type="text"
//                           placeholder="Ask something about the recording..."
//                           className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                           value={userInput}
//                           onChange={(e) => setUserInput(e.target.value)}
//                           onKeyPress={handleKeyPress}
//                         />
//                         <button
//                           onClick={handleSendChatMessage}
//                           disabled={chatLoading}
//                           className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                         >
//                           {chatLoading ? (
//                             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                             </svg>
//                           ) : (
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                               <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//                             </svg>
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               // Placeholder when no data is available
//               <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                 <div className="p-10 text-center">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
//                   </svg>
//                   <h3 className="text-lg font-medium text-gray-800 mb-2">No recording analyzed yet</h3>
//                   <p className="text-gray-500 max-w-md mx-auto">Upload an audio file to see transcription, analysis, and chat with AI about the content.</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







'use client'
import React, { useState } from 'react';

interface Aspect {
  text: string;
  sentiment: string;
  scores?: {
    [key: string]: number;
  };
}

interface TranscriptData {
  id: number;
  transcript: string;
  summary: string;
  emotion: string;
  aspects?: Aspect[];
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function Home() {
  // State management
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setAudioFile(e.dataTransfer.files[0]);
    }
  };

  // Upload the audio
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      alert('Please select an audio file first.');
      return;
    }

    try {
      setUploading(true);
      setTranscriptData(null);
      
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      setTranscriptData(data);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Something went wrong. Check the console for details.');
    } finally {
      setUploading(false);
    }
  };

  // Open the chat panel
  const handleOpenChat = () => {
    if (!transcriptData) {
      alert('No transcript data yet. Please upload an audio file first.');
      return;
    }
    setMessages([]);
    setUserInput('');
    setShowChat(true);
  };

  // Send a chat message
  const handleSendChatMessage = async () => {
    if (!transcriptData) {
      alert('No transcript to reference. Upload a file first.');
      return;
    }
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: userInput.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserInput('');

    try {
      setChatLoading(true);
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript_id: transcriptData.id,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: `Error: ${data.error}`,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: data.assistant_message || 'No response',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Error: ${err}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle key press for chat input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  // Get emotion badge color
  const getEmotionColor = (emotion: string) => {
    switch(emotion.toLowerCase()) {
      case 'happy':
      case 'excited':
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'sad':
      case 'negative':
      case 'angry':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-blue-100 text-blue-800';
      case 'mixed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">Audio Insight</h1>
          <p className="text-gray-600">Transcribe, analyze, and chat about your audio recordings</p>
        </header>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Left column: Upload and controls */}
          <div className="md:col-span-4 space-y-6">
            {/* Upload form */}
            <div 
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${dragActive ? 'ring-2 ring-indigo-500 scale-102' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Recording</h2>
                
                <form onSubmit={handleUpload}>
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-indigo-200 rounded-lg p-6 text-center cursor-pointer hover:bg-indigo-50 transition-colors">
                      <input
                        id="audio-file"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="audio-file" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span className="text-sm font-medium text-indigo-600">
                            {audioFile ? audioFile.name : 'Click to select or drag audio file here'}
                          </span>
                          {audioFile && (
                            <span className="text-xs text-gray-500 mt-1">
                              {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={uploading || !audioFile}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : 'Analyze Recording'}
                  </button>
                </form>
              </div>
            </div>

            {/* Mini instructions card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">How it works</h3>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Upload your audio recording</li>
                  <li>Review the transcript and analysis</li>
                  <li>Chat with AI about the content</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right column: Results and chat */}
          <div className="md:col-span-8 space-y-6">
            {transcriptData ? (
              <>
                {/* Results card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="border-b border-gray-100">
                    <div className="flex items-center p-6">
                      <div className="flex-grow">
                        <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
                      </div>
                      {/* Emotion badge */}
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEmotionColor(transcriptData.emotion)}`}>
                        {transcriptData.emotion}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button 
                          onClick={() => setActiveTab('summary')}
                          className={`${
                            activeTab === 'summary' 
                              ? 'border-indigo-500 text-indigo-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                          Summary
                        </button>
                        <button 
                          onClick={() => setActiveTab('transcript')}
                          className={`${
                            activeTab === 'transcript' 
                              ? 'border-indigo-500 text-indigo-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                          Full Transcript
                        </button>
                      </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'summary' ? (
                      <>
                        {/* LLM Summary */}
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-gray-800 mb-2">Key Points</h3>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {transcriptData.summary}
                          </p>
                        </div>

                        {/* Key Phrases */}
                        {transcriptData.aspects && transcriptData.aspects.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Key Phrases</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {transcriptData.aspects.map((aspect, idx) => {
                                let sentimentColor = 'bg-gray-100 text-gray-800';
                                if (aspect.sentiment === 'Positive') sentimentColor = 'bg-green-100 text-green-800 border-green-200';
                                else if (aspect.sentiment === 'Negative') sentimentColor = 'bg-red-100 text-red-800 border-red-200';
                                else if (aspect.sentiment === 'Mixed') sentimentColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                                else if (aspect.sentiment === 'Neutral') sentimentColor = 'bg-blue-100 text-blue-800 border-blue-200';

                                return (
                                  <div key={idx} className={`p-3 rounded-lg border ${sentimentColor} text-sm`}>
                                    <div className="font-medium">{aspect.text}</div>
                                    <div className="text-xs mt-1 opacity-75">{aspect.sentiment}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Full Transcript */
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-800">Full Transcript</h3>
                          <button 
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(transcriptData.transcript);
                                alert('Transcript copied to clipboard!');
                              }
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            Copy
                          </button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                            {transcriptData.transcript}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Chat button - shown in both tabs */}
                    <button
                      onClick={handleOpenChat}
                      className="mt-4 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      <span>Ask questions about this recording</span>
                    </button>
                  </div>
                </div>

                {/* Chat Panel */}
                {showChat && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat with AI Assistant</h2>
                      
                      {/* Chat messages */}
                      <div className="h-80 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                        {messages.length === 0 ? (
                          <div className="text-center text-gray-500 py-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <p>Ask a question about the recording to get started</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((m, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg max-w-3/4 ${
                                  m.role === 'assistant' 
                                    ? 'bg-indigo-50 text-left mr-auto' 
                                    : 'bg-indigo-600 text-white ml-auto'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                              </div>
                            ))}
                            {chatLoading && (
                              <div className="bg-indigo-50 text-left mr-auto p-3 rounded-lg">
                                <div className="flex space-x-1">
                                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Chat input */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Ask something about the recording..."
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                        <button
                          onClick={handleSendChatMessage}
                          disabled={chatLoading}
                          className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          {chatLoading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Placeholder when no data is available
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-10 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No recording analyzed yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Upload an audio file to see transcription, analysis, and chat with AI about the content.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}