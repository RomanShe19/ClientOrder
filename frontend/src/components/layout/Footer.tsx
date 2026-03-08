import React from 'react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            &copy; {year} {import.meta.env.VITE_APP_NAME || 'AutoVIP'}. Все права защищены.
          </p>
          <p className="text-xs text-text-secondary">
            Ваши данные защищены и не передаются третьим лицам
          </p>
        </div>
      </div>
    </footer>
  );
};
