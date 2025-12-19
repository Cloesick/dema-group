// src/components/TestComponent.tsx
import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
      <div className="shrink-0">
        <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">TW</span>
        </div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind CSS</div>
        <p className="text-slate-500">You have a new message!</p>
      </div>
    </div>
  );
};

export default TestComponent;