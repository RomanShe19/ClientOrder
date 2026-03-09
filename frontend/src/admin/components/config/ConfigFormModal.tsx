import { useState, useEffect, useRef } from 'react';
import type { AdminConfig } from '../../types/admin';

interface ConfigFormModalProps {
  config: AdminConfig | null;
  onSave: (data: {
    config_key: string;
    config_value: Record<string, unknown>;
    description?: string;
    is_active?: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

export const ConfigFormModal: React.FC<ConfigFormModalProps> = ({ config, onSave, onClose }) => {
  const isEdit = config !== null;
  const [configKey, setConfigKey] = useState(config?.config_key ?? '');
  const [configValueStr, setConfigValueStr] = useState(
    config ? JSON.stringify(config.config_value, null, 2) : '{\n  \n}'
  );
  const [description, setDescription] = useState(config?.description ?? '');
  const [isActive, setIsActive] = useState(config?.is_active ?? true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    keyRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const validateJson = (str: string): Record<string, unknown> | null => {
    try {
      const parsed = JSON.parse(str);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setJsonError('Значение должно быть JSON-объектом (не массив, не null)');
        return null;
      }
      setJsonError(null);
      return parsed;
    } catch {
      setJsonError('Невалидный JSON');
      return null;
    }
  };

  const handleJsonChange = (val: string) => {
    setConfigValueStr(val);
    if (val.trim()) validateJson(val);
    else setJsonError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!configKey.trim()) {
      setError('Ключ обязателен');
      return;
    }

    const parsed = validateJson(configValueStr);
    if (!parsed) return;

    setSubmitting(true);
    try {
      await onSave({
        config_key: configKey.trim(),
        config_value: parsed,
        description: description.trim() || undefined,
        is_active: isActive,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Редактировать услугу' : 'Добавить услугу'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ключ</label>
            <input
              ref={keyRef}
              type="text"
              value={configKey}
              onChange={(e) => setConfigKey(e.target.value)}
              placeholder="service_key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              disabled={isEdit}
            />
            {isEdit && (
              <p className="text-xs text-gray-400 mt-1">Ключ нельзя изменить</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание услуги..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Значение (JSON)
            </label>
            <textarea
              value={configValueStr}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={8}
              spellCheck={false}
              className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:border-blue-500 outline-none transition-shadow resize-y ${
                jsonError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {jsonError && (
              <p className="text-xs text-red-500 mt-1">{jsonError}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">{isActive ? 'Активна' : 'Неактивна'}</span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting || !!jsonError}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isEdit ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
