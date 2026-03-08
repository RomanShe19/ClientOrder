import api from './api';
import type { LeadCreate, LeadResponse } from '../types/lead';

export const leadService = {
  async create(data: LeadCreate): Promise<LeadResponse> {
    const response = await api.post<LeadResponse>('/leads/', data);
    return response.data;
  },
};
