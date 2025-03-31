// 'use client';

// import React, { useState } from 'react';
// import Header from './components/layout/Header';
// import Sidebar from './components/layout/Sidebar';
// import UploadBox from './components/ui/UploadBox';
// import AssistantPanel from './components/ui/AssistantPanel';

// export default function Home() {
//   const [hasFile, setHasFile] = useState(false);
  
//   const handleFileUpload = (file: File) => {
//     console.log('File uploaded:', file.name);
//     setHasFile(true);
//   };
  
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header userName="Hector, RDZ" userRole="Admin" />
      
//       <div className="flex flex-1">
//         <Sidebar hasItems={false} />
        
//         <main className="flex-1 p-4 flex items-center justify-center">
//           <div className="w-full max-w-3xl">
//             <div className="mb-4 text-center">
//               <h2 className="text-xl font-bold">¡Bienvenido a HowlX!</h2>
//             </div>
//             <UploadBox onUpload={handleFileUpload} />
//           </div>
//         </main>
        
//         <AssistantPanel isActive={hasFile} />
//       </div>
//     </div>
//   );
// }




'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import UploadBox from '../components/ui/UploadBox';
import ProcessingStatus from '../components/ui/ProcessingStatus';
import TranscriptResults from '../components/transcription/TranscriptResults';
import ChatPanel from '../components/transcription/ChatPanel';

interface Aspect {
  text: string;
  sentiment: string;
  scores?: { [key: string]: number };
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
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Processing steps state
  const [currentStep, setCurrentStep] = useState<string>('');
  const [processingHistory, setProcessingHistory] = useState<string[]>([]);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // We'll store the final transcript analysis here, once it's done
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  
  // Function to update processing step with delay
  const updateProcessingStep = (step: string) => {
    // Clear any existing timer
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
    }
    
    // Set the current step immediately and add to history
    setCurrentStep(step);
    setProcessingHistory(prev => [...prev, step]);
    
    // Set a timer to ensure this step stays visible for at least 1 second
    stepTimerRef.current = setTimeout(() => {
      stepTimerRef.current = null;
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    };
  }, []);

  // Handle file selection
  const handleFileChange = (file: File) => {
    setAudioFile(file);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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

  // Upload the audio and read SSE chunked responses
  const handleUpload = async () => {
    if (!audioFile) {
      alert('Please select an audio file first.');
      return;
    }

    try {
      setUploading(true);
      setCurrentStep('');
      setProcessingHistory([]);
      setTranscriptData(null); // reset final data

      const formData = new FormData();
      formData.append('file', audioFile);

      // POST to the SSE endpoint
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Upload SSE error. Status: ${response.status}`);
      }

      // Manually read the streamed body
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let partialChunk = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break; // finished reading

        // Decode the chunk into text
        partialChunk += decoder.decode(value, { stream: true });
        // We split on double-newline to separate SSE "events"
        const parts = partialChunk.split('\n\n');
        // Keep the last partial piece in partialChunk
        partialChunk = parts.pop() || '';

        // Process each complete SSE event
        for (let sseMessage of parts) {
          // Remove the leading "data: " (if present)
          const cleaned = sseMessage.replace(/^data:\s?/, '');
          try {
            // Try parsing as JSON (final results)
            const obj = JSON.parse(cleaned);
            setTranscriptData(obj);
            updateProcessingStep('Analysis complete!');
          } catch {
            // If not JSON, treat it as a status update
            updateProcessingStep(cleaned);
          }
        }
      }
    } catch (err) {
      console.error('Error uploading file (SSE):', err);
      alert('Something went wrong. Check console for details.');
      updateProcessingStep(`Error: ${err}`);
    } finally {
      setUploading(false);
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }
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
  const handleSendChatMessage = async (message: string) => {
    if (!transcriptData) {
      alert('No transcript to reference. Upload a file first.');
      return;
    }
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: message.trim(),
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
        setMessages(prev => [...prev, errorMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: data.assistant_message || 'No response',
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Error: ${err}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header userName="Hector, RDZ" userRole="Admin" />
      
      <div className="flex flex-1">
        <Sidebar hasItems={false} />
        
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-indigo-800">¡Bienvenido a HowlX!</h2>
              <p className="text-gray-600">Transcribe, analyze, and chat about your audio recordings</p>
            </div>
            
            <div className="grid md:grid-cols-12 gap-6">
              {/* Left column: Upload and controls */}
              <div className="md:col-span-4 space-y-6">
                <div 
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                    dragActive ? 'ring-2 ring-indigo-500 scale-102' : ''
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Recording</h2>
                    <UploadBox 
                      onFileChange={handleFileChange} 
                      onUpload={handleUpload}
                      uploading={uploading}
                      file={audioFile}
                    />
                  </div>
                </div>
                
                {/* Mini instructions card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">How it works</h3>
                    <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                      <li>Upload your audio recording</li>
                      <li>View real-time processing steps below</li>
                      <li>Review the transcript and analysis</li>
                      <li>Chat with AI about the content</li>
                    </ol>
                  </div>
                </div>
                
                {/* Processing Steps UI */}
                {currentStep && (
                  <ProcessingStatus currentStep={currentStep} />
                )}
              </div>
              
              {/* Right column: Results and chat */}
              <div className="md:col-span-8 space-y-6">
                {transcriptData ? (
                  <>
                    <TranscriptResults 
                      data={transcriptData} 
                      onChatOpen={handleOpenChat} 
                    />
                    
                    {/* Chat Panel */}
                    {showChat && (
                      <ChatPanel 
                        messages={messages}
                        loading={chatLoading}
                        onSendMessage={handleSendChatMessage}
                        userInput={userInput}
                        setUserInput={setUserInput}
                      />
                    )}
                  </>
                ) : (
                  // Placeholder when no data is available
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-10 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-indigo-300 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No recording analyzed yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Upload an audio file to see transcription, analysis, and chat with AI about the content.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}