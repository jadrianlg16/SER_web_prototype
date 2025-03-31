import React from 'react';
// import Metadata from 'next';
import './styles/globals.css';

// export const metadata: Metadata = {
//   title: 'HowlX - AI Transcription & Analysis',
//   description: 'Upload, transcribe and analyze your audio files with AI assistance',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}