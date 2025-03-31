import React, { useState } from 'react';
import Button from './Button';

interface AssistantPanelProps {
  isActive: boolean;
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({ isActive }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="border-l border-gray-200 w-72 p-4 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
        <h2 className="text-lg font-medium">Asistente Howl AI</h2>
      </div>

      <div className="flex-grow">
        {isActive ? (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
            <p>Escribe una pregunta y nuestra IA resumirá al instante los puntos clave, recordará detalles, redactará contenido y descubrirá información a partir de la transcripción.</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              Carga un archivo para activar el asistente
            </p>
          </div>
        )}
      </div>

      {isActive && (
        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cuéntame"
              className="w-full border border-gray-300 rounded-md py-2 px-4 pr-10"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssistantPanel;