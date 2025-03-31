// Define reusable types for the application

export interface Aspect {
    text: string;
    sentiment: string;
    scores?: { [key: string]: number };
  }
  
  export interface TranscriptData {
    id: number;
    transcript: string;
    summary: string;
    emotion: string;
    aspects?: Aspect[];
  }
  
  export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }