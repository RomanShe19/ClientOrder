import type { AdminUser } from '../types/auth';

export function isSuperadmin(admin: AdminUser | null): boolean {
  return admin?.role === 'superadmin';
}

export function canManageAdmins(admin: AdminUser | null): boolean {
  return admin?.role === 'superadmin';
}
