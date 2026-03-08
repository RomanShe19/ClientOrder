import api from './api';
import type { AnalyticsCreate, AnalyticsResponse } from '../types/analytics';

export const analyticsService = {
  async create(data: AnalyticsCreate): Promise<AnalyticsResponse> {
    const response = await api.post<AnalyticsResponse>('/analytics/', data);
    return response.data;
  },
};
