import React from 'react';
import Button from '../ui/Button';

interface SidebarProps {
  hasItems: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ hasItems }) => {
  return (
    <div className="w-72 border-r border-gray-200 min-h-screen p-4">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Historial de llamadas</h2>
      </div>
      
      <div className="mt-4">
        <Button 
          variant="outline"
          icon="+"
          fullWidth
          onClick={() => console.log('Add new call')}
        >
          Agregar nueva llamada
        </Button>
      </div>
      
      {!hasItems && (
        <div className="mt-16 text-center text-gray-500">
          <p>Aún no tienes ninguna</p>
          <p>llamada cargada</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;