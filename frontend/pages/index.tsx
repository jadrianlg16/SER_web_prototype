'use client'
import React, { useState } from 'react';

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [emotion, setEmotion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      alert('Please select an audio file first.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', audioFile);

      // Point to your FastAPI backend
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      setTranscript(data.transcript);
      setSummary(data.summary);
      setEmotion(data.emotion);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Something went wrong. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription &amp; Analysis</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 w-full max-w-md">
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
          disabled={loading}
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Upload'}
        </button>
      </form>

      {transcript && (
        <div className="bg-white rounded shadow p-4 mt-4 w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">Transcript</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
        </div>
      )}

      {summary && (
        <div className="bg-white rounded shadow p-4 mt-4 w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">Summary</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {emotion && (
        <div className="bg-white rounded shadow p-4 mt-4 w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">Emotion</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{emotion}</p>
        </div>
      )}
    </div>
  );
}
