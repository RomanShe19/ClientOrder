import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

export const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    authService
      .isRegistrationAvailable()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);

  if (available === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!available) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AutoVIP</h1>
          <p className="text-gray-500 mt-1 text-sm">Регистрация первого администратора</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <RegisterForm />
        </div>

        <p className="text-center mt-4 text-sm text-gray-500">
          Уже есть аккаунт?{' '}
          <Link to="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};
