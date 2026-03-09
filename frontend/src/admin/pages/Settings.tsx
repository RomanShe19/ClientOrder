import { useEffect, useState, useCallback } from 'react';
import { ConfigTable } from '../components/config/ConfigTable';
import { ConfigFormModal } from '../components/config/ConfigFormModal';
import { DeleteConfirmModal } from '../components/config/DeleteConfirmModal';
import { adminService } from '../services/adminService';
import type { AdminConfig } from '../types/admin';

export const SettingsPage: React.FC = () => {
  const [configs, setConfigs] = useState<AdminConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<AdminConfig | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingConfig, setDeletingConfig] = useState<AdminConfig | null>(null);
  const [search, setSearch] = useState('');

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getConfigs();
      setConfigs(data);
    } catch {
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleToggle = async (config: AdminConfig) => {
    try {
      await adminService.updateConfig(config.id, { is_active: !config.is_active });
      await fetchConfigs();
    } catch {
      alert('Ошибка при обновлении статуса');
    }
  };

  const handleCreate = async (data: {
    config_key: string;
    config_value: Record<string, unknown>;
    description?: string;
    is_active?: boolean;
  }) => {
    await adminService.createConfig(data);
    setShowCreateModal(false);
    await fetchConfigs();
  };

  const handleEdit = async (data: {
    config_key: string;
    config_value: Record<string, unknown>;
    description?: string;
    is_active?: boolean;
  }) => {
    if (!editingConfig) return;
    await adminService.updateConfig(editingConfig.id, {
      config_value: data.config_value,
      description: data.description ?? null,
      is_active: data.is_active,
    });
    setEditingConfig(null);
    await fetchConfigs();
  };

  const handleDelete = async () => {
    if (!deletingConfig) return;
    await adminService.deleteConfig(deletingConfig.id);
    setDeletingConfig(null);
    await fetchConfigs();
  };

  const filteredConfigs = search.trim()
    ? configs.filter(
        (c) =>
          c.config_key.toLowerCase().includes(search.toLowerCase()) ||
          (c.description || '').toLowerCase().includes(search.toLowerCase())
      )
    : configs;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Настройки услуг</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Управление услугами и конфигурациями системы
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить услугу
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по ключу или описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium">
              {filteredConfigs.length} из {configs.length}
            </span>
            <button
              onClick={fetchConfigs}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Обновить"
            >
              <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <ConfigTable
              configs={filteredConfigs}
              onEdit={(cfg) => setEditingConfig(cfg)}
              onDelete={(cfg) => setDeletingConfig(cfg)}
              onToggle={handleToggle}
            />
          )}
        </div>
      </div>

      {showCreateModal && (
        <ConfigFormModal
          config={null}
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingConfig && (
        <ConfigFormModal
          config={editingConfig}
          onSave={handleEdit}
          onClose={() => setEditingConfig(null)}
        />
      )}

      {deletingConfig && (
        <DeleteConfirmModal
          config={deletingConfig}
          onConfirm={handleDelete}
          onClose={() => setDeletingConfig(null)}
        />
      )}
    </div>
  );
};
