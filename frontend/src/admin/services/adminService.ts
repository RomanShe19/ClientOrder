import adminApi from './api';
import type {
  AdminUser,
  AdminUpdate,
  DashboardStats,
  PaginatedLeads,
  LeadDetail,
  AdminConfig,
  UserAnalytics,
} from '../types/admin';

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await adminApi.get<DashboardStats>('/v1/admin/dashboard/stats');
    return response.data;
  },

  async getUserAnalytics(): Promise<UserAnalytics> {
    const response = await adminApi.get<UserAnalytics>('/v1/admin/dashboard/analytics');
    return response.data;
  },

  async getLeads(params: {
    skip?: number;
    limit?: number;
    budget?: string;
    date_from?: string;
    date_to?: string;
    sort?: 'urgency' | 'date';
  }): Promise<PaginatedLeads> {
    const response = await adminApi.get<PaginatedLeads>('/v1/admin/leads', { params });
    return response.data;
  },

  async getLeadDetail(id: number): Promise<LeadDetail> {
    const response = await adminApi.get<LeadDetail>(`/v1/admin/leads/${id}`);
    return response.data;
  },

  async getAdmins(): Promise<AdminUser[]> {
    const response = await adminApi.get<AdminUser[]>('/v1/admin/list');
    return response.data;
  },

  async getAdmin(id: number): Promise<AdminUser> {
    const response = await adminApi.get<AdminUser>(`/v1/admin/${id}`);
    return response.data;
  },

  async updateAdmin(id: number, data: AdminUpdate): Promise<AdminUser> {
    const response = await adminApi.put<AdminUser>(`/v1/admin/${id}`, data);
    return response.data;
  },

  async deleteAdmin(id: number): Promise<void> {
    await adminApi.delete(`/v1/admin/${id}`);
  },

  async getConfigs(): Promise<AdminConfig[]> {
    const response = await adminApi.get<AdminConfig[]>('/admin/configs/', {
      params: { limit: 500 },
    });
    return response.data;
  },

  async createConfig(data: {
    config_key: string;
    config_value: Record<string, unknown>;
    description?: string;
    is_active?: boolean;
  }): Promise<AdminConfig> {
    const response = await adminApi.post<AdminConfig>('/admin/configs/', data);
    return response.data;
  },

  async updateConfig(
    id: number,
    data: Partial<AdminConfig>
  ): Promise<AdminConfig> {
    const response = await adminApi.patch<AdminConfig>(`/admin/configs/${id}`, data);
    return response.data;
  },

  async deleteConfig(id: number): Promise<void> {
    await adminApi.delete(`/admin/configs/${id}`);
  },
};
