export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'superadmin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface AdminUpdate {
  username?: string;
  email?: string;
  role?: 'admin' | 'superadmin';
  is_active?: boolean;
}

export interface LeadAnalysis {
  temperature: 'hot' | 'warm' | 'cold';
  score: number;
  personal_manager_needed: boolean;
  department: string;
  worth_time: boolean;
  reason_summary: string;
}

export interface LeadItem {
  id: number;
  first_name: string | null;
  last_name: string | null;
  contact_phone: string;
  contact_email: string | null;
  business_niche: string;
  company_size?: string;
  client_role?: string;
  budget: string;
  task_type: string;
  result_deadline?: string;
  created_at: string;
  analysis?: LeadAnalysis;
}

export interface LeadDetail {
  id: number;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  contact_phone: string;
  contact_email: string | null;
  business_niche: string;
  company_size: string;
  task_volume: string;
  client_role: string;
  budget: string;
  preferred_contact_method: string;
  preferred_contact_time: string;
  product_interest: string;
  task_type: string;
  result_deadline: string;
  comments: string | null;
  created_at: string;
  updated_at: string;
  analysis?: LeadAnalysis;
}

export const TEMPERATURE_LABELS: Record<string, string> = {
  hot: 'Горячий',
  warm: 'Тёплый',
  cold: 'Холодный',
};

export interface PaginatedLeads {
  items: LeadItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface DashboardStats {
  total_leads: number;
  new_leads_today: number;
  active_admins: number;
  leads_hot?: number;
  leads_warm?: number;
  leads_cold?: number;
}

export interface AdminConfig {
  id: number;
  config_key: string;
  config_value: Record<string, unknown>;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAnalytics {
  avg_time_day: number;
  avg_time_week: number;
  avg_time_month: number;
  max_time: number;
  total_sessions: number;
  heatmap_grid: Record<string, number>;
  cursor_positions: Array<{ x: number; y: number }>;
  button_clicks: Record<string, number>;
}
