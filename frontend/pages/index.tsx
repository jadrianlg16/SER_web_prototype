'use client'
import React, { useState } from 'react';

interface TranscriptData {
  id: number;
  transcript: string;
  summary: string;
  emotion: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function Home() {
  // ---------------------------
  // State for uploading & results
  // ---------------------------
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);

  // ---------------------------
  // State for chat
  // ---------------------------
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // ---------------------------
  // Handle file selection
  // ---------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  // ---------------------------
  // Upload the audio
  // ---------------------------
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      alert('Please select an audio file first.');
      return;
    }

    try {
      setUploading(true);
      setTranscriptData(null); // reset old data
      // Create FormData
      const formData = new FormData();
      formData.append('file', audioFile);

      // Point to your FastAPI backend at http://localhost:8000
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      /*
        data should look like:
        {
          id: number,
          transcript: string,
          summary: string,
          emotion: string
        }
      */
      setTranscriptData(data);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Something went wrong. Check the console for details.');
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------
  // Open the chat panel
  // ---------------------------
  const handleOpenChat = () => {
    if (!transcriptData) {
      alert('No transcript data yet. Please upload an audio file first.');
      return;
    }
    // Clear old chat messages
    setMessages([]);
    setUserInput('');
    setShowChat(true);
  };

  // ---------------------------
  // Send a chat message
  // ---------------------------
  const handleSendChatMessage = async () => {
    if (!transcriptData) {
      alert('No transcript to reference. Upload a file first.');
      return;
    }

    if (!userInput.trim()) return;

    // Add user's message to local state
    const userMsg: ChatMessage = {
      role: 'user',
      content: userInput.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserInput('');

    // Call /chat on your FastAPI backend
    try {
      setChatLoading(true);
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript_id: transcriptData.id,
          messages: updatedMessages, // send entire conversation
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        // error from backend
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: `Error: ${data.error}`,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        // success
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

  // ---------------------------
  // JSX Output
  // ---------------------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription &amp; Analysis</h1>

      {/* UPLOAD FORM */}
      <form onSubmit={handleUpload} className="bg-white rounded shadow p-4 w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="audio-file">
            Upload an audio file:
          </label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
             file:mr-4 file:py-2 file:px-4
             file:rounded-full file:border-0
             file:text-sm file:font-semibold
             file:bg-indigo-50 file:text-indigo-700
             hover:file:bg-indigo-100"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {uploading ? 'Processing...' : 'Upload'}
        </button>
      </form>

      {/* RESULTS */}
      {transcriptData && (
        <div className="bg-white rounded shadow p-4 mt-4 w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">Transcript</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{transcriptData.transcript}</p>

          <h2 className="text-xl font-bold mt-4 mb-2">Summary</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{transcriptData.summary}</p>

          <h2 className="text-xl font-bold mt-4 mb-2">Emotion</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{transcriptData.emotion}</p>

          <button
            onClick={handleOpenChat}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Chat about this transcript
          </button>
        </div>
      )}

      {/* CHAT PANEL */}
      {showChat && transcriptData && (
        <div className="bg-white rounded shadow p-4 mt-4 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Chat with LLM</h2>
          <div className="h-64 overflow-y-auto border p-2 mb-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`my-1 p-2 rounded ${
                  m.role === 'assistant'
                    ? 'bg-blue-100 text-left'
                    : 'bg-gray-100 text-right'
                }`}
              >
                <strong>{m.role === 'assistant' ? 'Assistant' : 'You'}: </strong>
                {m.content}
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask something about the transcript..."
              className="flex-1 border p-2"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button
              onClick={handleSendChatMessage}
              disabled={chatLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {chatLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
