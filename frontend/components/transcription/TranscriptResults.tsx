import React, { useState } from 'react';

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

interface TranscriptResultsProps {
  data: TranscriptData;
  onChatOpen: () => void;
}

const TranscriptResults: React.FC<TranscriptResultsProps> = ({ data, onChatOpen }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');

  // Utility to get emotion color
  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="border-b border-gray-100">
        <div className="flex items-center p-6">
          <div className="flex-grow">
            <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
          </div>
          {/* Emotion badge */}
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getEmotionColor(
              data.emotion
            )}`}
          >
            {data.emotion}
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
                {data.summary}
              </p>
            </div>

            {/* Key Phrases */}
            {data.aspects && data.aspects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Key Phrases</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.aspects.map((aspect, idx) => {
                    let sentimentColor = 'bg-gray-100 text-gray-800';
                    if (aspect.sentiment === 'Positive')
                      sentimentColor = 'bg-green-100 text-green-800 border-green-200';
                    else if (aspect.sentiment === 'Negative')
                      sentimentColor = 'bg-red-100 text-red-800 border-red-200';
                    else if (aspect.sentiment === 'Mixed')
                      sentimentColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    else if (aspect.sentiment === 'Neutral')
                      sentimentColor = 'bg-blue-100 text-blue-800 border-blue-200';

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${sentimentColor} text-sm`}
                      >
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
          // Full Transcript
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-800">Full Transcript</h3>
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(data.transcript);
                    alert('Transcript copied to clipboard!');
                  }
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                {data.transcript}
              </p>
            </div>
          </div>
        )}

        {/* Chat button */}
        <button
          onClick={onChatOpen}
          className="mt-4 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          <span>Ask questions about this recording</span>
        </button>
      </div>
    </div>
  );
};

export default TranscriptResults;