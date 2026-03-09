import { useEffect, useState, useCallback } from 'react';
import { AdminTable } from '../components/admins/AdminTable';
import { adminService } from '../services/adminService';
import type { AdminUser } from '../types/admin';

export const AdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdmins();
      setAdmins(data);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleToggleActive = async (admin: AdminUser) => {
    if (!confirm(`${admin.is_active ? 'Деактивировать' : 'Активировать'} ${admin.username}?`)) return;
    try {
      await adminService.updateAdmin(admin.id, { is_active: !admin.is_active });
      await fetchAdmins();
    } catch {
      alert('Ошибка при обновлении');
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    if (!confirm(`Удалить администратора ${admin.username}? Это действие необратимо.`)) return;
    try {
      await adminService.deleteAdmin(admin.id);
      await fetchAdmins();
    } catch {
      alert('Ошибка при удалении');
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Администраторы</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <AdminTable
            admins={admins}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};
