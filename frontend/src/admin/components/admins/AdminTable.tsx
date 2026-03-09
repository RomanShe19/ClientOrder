import { format } from 'date-fns';
import type { AdminUser } from '../../types/admin';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { useAuthStore } from '../../store/authStore';

interface AdminTableProps {
  admins: AdminUser[];
  onToggleActive: (admin: AdminUser) => void;
  onDelete: (admin: AdminUser) => void;
}

export const AdminTable: React.FC<AdminTableProps> = ({ admins, onToggleActive, onDelete }) => {
  const { canManageAdmins } = useAdminPermissions();
  const currentAdmin = useAuthStore((s) => s.admin);

  if (admins.length === 0) {
    return <div className="text-center py-12 text-gray-500">Нет администраторов</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="pb-3 pr-4 font-semibold text-gray-600">ID</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Логин</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Email</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Роль</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Последний вход</th>
            <th className="pb-3 pr-4 font-semibold text-gray-600">Статус</th>
            {canManageAdmins && <th className="pb-3 font-semibold text-gray-600">Действия</th>}
          </tr>
        </thead>
        <tbody>
          {admins.map((admin, idx) => (
            <tr
              key={admin.id}
              className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              <td className="py-3 pr-4 text-gray-500">#{admin.id}</td>
              <td className="py-3 pr-4 font-medium text-gray-900">{admin.username}</td>
              <td className="py-3 pr-4 text-gray-700">{admin.email}</td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    admin.role === 'superadmin'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {admin.role}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-500 text-xs">
                {admin.last_login
                  ? format(new Date(admin.last_login), 'dd.MM.yyyy HH:mm')
                  : '—'}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                    admin.is_active ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className="text-xs text-gray-600">
                  {admin.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </td>
              {canManageAdmins && (
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {currentAdmin?.id !== admin.id && (
                      <>
                        <button
                          onClick={() => onToggleActive(admin)}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {admin.is_active ? 'Деактивировать' : 'Активировать'}
                        </button>
                        <button
                          onClick={() => onDelete(admin)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
