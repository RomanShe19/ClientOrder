import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [registrationAvailable, setRegistrationAvailable] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setReady(true));
    authService.isRegistrationAvailable().then(setRegistrationAvailable).catch(() => {});
  }, [checkAuth]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AutoVIP</h1>
          <p className="text-gray-500 mt-1 text-sm">Вход в панель управления</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <LoginForm />
        </div>

        {registrationAvailable && (
          <p className="text-center mt-4 text-sm text-gray-500">
            Нет аккаунта?{' '}
            <Link to="/admin/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Зарегистрироваться
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
