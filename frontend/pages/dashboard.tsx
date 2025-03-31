'use client';

import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import AssistantPanel from '../components/ui/AssistantPanel';

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header userName="Hector, RDZ" userRole="Admin" />
      
      <div className="flex flex-1">
        <Sidebar hasItems={true} />
        
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dashboard cards would go here */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-medium">Transcriptions</h2>
              <p className="text-2xl font-bold">24</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-medium">Analyzed Files</h2>
              <p className="text-2xl font-bold">18</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-medium">AI Assists</h2>
              <p className="text-2xl font-bold">42</p>
            </div>
          </div>
        </main>
        
        <AssistantPanel isActive={true} />
      </div>
    </div>
  );
};

export default Dashboard;