import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-button flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-premium">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-premium">
              {import.meta.env.VITE_APP_NAME || 'AutoVIP'}
            </h1>
            <p className="text-xs text-text-secondary">Персональные решения для вашего бизнеса</p>
          </div>
        </div>
      </div>
    </header>
  );
};
