export interface ApiError {
  detail: string | ApiValidationError[];
}

export interface ApiValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
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

export interface ServiceOption {
  key: string;
  name: string;
  description: string;
  priceMin: number;
  priceMax: number;
  unit: string;
  currency: string;
}

export interface FormConfigOptions {
  niches: string[];
  budgets: string[];
  taskTypes: string[];
  services: ServiceOption[];
}
