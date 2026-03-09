import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAdmin, error, clearError } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (form.username.length < 3 || form.username.length > 50) {
      errors.username = 'Имя пользователя: от 3 до 50 символов';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      errors.username = 'Только буквы, цифры и подчёркивание';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Введите корректный email';
    }

    if (form.password.length < 8) {
      errors.password = 'Минимум 8 символов';
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = 'Нужна хотя бы одна заглавная буква';
    } else if (!/[0-9]/.test(form.password)) {
      errors.password = 'Нужна хотя бы одна цифра';
    } else if (!/[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(form.password)) {
      errors.password = 'Нужен хотя бы один спецсимвол';
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await registerAdmin(form.username, form.email, form.password, form.confirmPassword);
      navigate('/admin/dashboard', { replace: true });
    } catch {
      // error is set in store
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field: string) =>
    `w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-400
     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
     ${validationErrors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1.5">
          Имя пользователя
        </label>
        <input
          id="reg-username"
          type="text"
          value={form.username}
          onChange={handleChange('username')}
          required
          autoComplete="username"
          className={fieldClass('username')}
          placeholder="admin"
        />
        {validationErrors.username && (
          <p className="text-sm text-red-600 mt-1">{validationErrors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          required
          autoComplete="email"
          className={fieldClass('email')}
          placeholder="admin@example.com"
        />
        {validationErrors.email && (
          <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Пароль
        </label>
        <input
          id="reg-password"
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          required
          autoComplete="new-password"
          className={fieldClass('password')}
          placeholder="••••••••"
        />
        {validationErrors.password && (
          <p className="text-sm text-red-600 mt-1">{validationErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
          Подтвердите пароль
        </label>
        <input
          id="reg-confirm"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          required
          autoComplete="new-password"
          className={fieldClass('confirmPassword')}
          placeholder="••••••••"
        />
        {validationErrors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">{validationErrors.confirmPassword}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
          flex items-center justify-center"
      >
        {submitting ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          'Зарегистрироваться'
        )}
      </button>
    </form>
  );
};
