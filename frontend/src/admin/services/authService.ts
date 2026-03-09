import adminApi from './api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegistrationAvailableResponse,
} from '../types/auth';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await adminApi.post<AuthResponse>('/v1/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await adminApi.post<AuthResponse>('/v1/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await adminApi.post('/v1/auth/logout');
  },

  async refresh(): Promise<AuthResponse> {
    const response = await adminApi.post<AuthResponse>('/v1/auth/refresh');
    return response.data;
  },

  async me(): Promise<AuthResponse['admin']> {
    const response = await adminApi.get<AuthResponse['admin']>('/v1/auth/me');
    return response.data;
  },

  async isRegistrationAvailable(): Promise<boolean> {
    const response = await adminApi.get<RegistrationAvailableResponse>(
      '/v1/auth/registration-available'
    );
    return response.data.available;
  },
};
