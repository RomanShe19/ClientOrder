import axios from 'axios';
import type { AdminConfig, FormConfigOptions, ServiceOption } from '../types/api';
import { DEFAULT_NICHES, DEFAULT_BUDGETS, DEFAULT_TASK_TYPES } from '../types/lead';

interface RetryableConfig {
  _retryCount?: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig & typeof error.config;
    if (!config || (config._retryCount ?? 0) >= 2) {
      return Promise.reject(error);
    }
    config._retryCount = (config._retryCount ?? 0) + 1;

    if (error.response?.status >= 500) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * config._retryCount!)
      );
      return api(config);
    }

    return Promise.reject(error);
  }
);

function extractOptions(config: AdminConfig): string[] {
  const val = config.config_value;
  if (Array.isArray(val)) return val as string[];
  if (val && typeof val === 'object' && 'options' in val && Array.isArray(val.options)) {
    return val.options as string[];
  }
  return [];
}

async function fetchConfigByKey(key: string): Promise<string[]> {
  try {
    const response = await api.get<AdminConfig>(`/admin/configs/by-key/${key}`);
    return extractOptions(response.data);
  } catch {
    return [];
  }
}

async function fetchServices(): Promise<ServiceOption[]> {
  try {
    const response = await api.get<AdminConfig[]>('/admin/configs/', {
      params: { active_only: true },
    });
    return response.data
      .filter((c) => c.config_key.startsWith('service_'))
      .map((c) => {
        const v = c.config_value as Record<string, unknown>;
        return {
          key: c.config_key,
          name: (v.name as string) || c.config_key,
          description: (v.description as string) || '',
          priceMin: (v.price_min as number) || 0,
          priceMax: (v.price_max as number) || 0,
          unit: (v.unit as string) || '',
          currency: (v.currency as string) || 'RUB',
        };
      });
  } catch {
    return [];
  }
}

export async function fetchFormConfigs(): Promise<FormConfigOptions> {
  const [niches, budgets, taskTypes, services] = await Promise.all([
    fetchConfigByKey('business_niches'),
    fetchConfigByKey('budget_ranges'),
    fetchConfigByKey('task_types'),
    fetchServices(),
  ]);

  return {
    niches: niches.length > 0 ? niches : DEFAULT_NICHES,
    budgets: budgets.length > 0 ? budgets : DEFAULT_BUDGETS,
    taskTypes: taskTypes.length > 0 ? taskTypes : DEFAULT_TASK_TYPES,
    services,
  };
}

export default api;
