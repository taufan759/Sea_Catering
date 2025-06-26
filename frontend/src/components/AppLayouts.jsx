import React from 'react';
import Sidebar from './common/Sidebar';

const AppLayouts = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-grow bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayouts;