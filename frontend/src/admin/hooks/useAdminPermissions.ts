import { useAuthStore } from '../store/authStore';

export function useAdminPermissions() {
  const admin = useAuthStore((s) => s.admin);

  return {
    isSuperadmin: admin?.role === 'superadmin',
    isAdmin: admin?.role === 'admin' || admin?.role === 'superadmin',
    canManageAdmins: admin?.role === 'superadmin',
    canDeleteAdmins: admin?.role === 'superadmin',
  };
}
