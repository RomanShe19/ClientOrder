import { useState } from 'react';
import type { AdminConfig } from '../../types/admin';

interface ConfigTableProps {
  configs: AdminConfig[];
  onEdit: (config: AdminConfig) => void;
  onDelete: (config: AdminConfig) => void;
  onToggle: (config: AdminConfig) => void;
}

export const ConfigTable: React.FC<ConfigTableProps> = ({ configs, onEdit, onDelete, onToggle }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (configs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm">Нет услуг. Добавьте первую услугу.</p>
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left">
            <th className="pb-3 pr-3 font-semibold text-gray-600 w-8"></th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Ключ</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Описание</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600 text-center">Статус</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Обновлено</th>
            <th className="pb-3 font-semibold text-gray-600 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((cfg) => (
            <>
              <tr
                key={cfg.id}
                className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors group"
              >
                <td className="py-3 pr-3">
                  <button
                    onClick={() => toggleExpand(cfg.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Показать значение"
                  >
                    <svg className={`h-4 w-4 transition-transform ${expandedId === cfg.id ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {cfg.config_key}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-600 text-xs max-w-[200px]">
                  {cfg.description || <span className="text-gray-300 italic">—</span>}
                </td>
                <td className="py-3 pr-4 text-center">
                  <button
                    onClick={() => onToggle(cfg)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      cfg.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {cfg.is_active ? 'Активна' : 'Неактивна'}
                  </button>
                </td>
                <td className="py-3 pr-4 text-xs text-gray-400">
                  {formatDate(cfg.updated_at)}
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(cfg)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Редактировать"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(cfg)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Удалить"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              {expandedId === cfg.id && (
                <tr key={`${cfg.id}-expanded`} className="bg-gray-50/70">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="text-xs">
                      <span className="font-semibold text-gray-500 mb-1 block">Значение (JSON):</span>
                      <pre className="bg-gray-900 text-green-300 rounded-lg p-3 overflow-x-auto text-xs leading-relaxed">
                        {JSON.stringify(cfg.config_value, null, 2)}
                      </pre>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};
