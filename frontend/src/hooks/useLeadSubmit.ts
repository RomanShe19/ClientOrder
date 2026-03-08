import { useState, useCallback } from 'react';
import { leadService } from '../services/leadService';
import type { LeadCreate, LeadResponse } from '../types/lead';
import axios from 'axios';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function useLeadSubmit() {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<number | null>(null);

  const submit = useCallback(async (data: LeadCreate): Promise<LeadResponse | null> => {
    setStatus('loading');
    setError(null);

    try {
      const response = await leadService.create(data);
      setLeadId(response.id);
      setStatus('success');
      return response;
    } catch (err: unknown) {
      let message = 'Произошла ошибка при отправке заявки. Попробуйте ещё раз.';

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          message = 'Пожалуйста, проверьте правильность заполнения формы.';
        } else if (err.response?.status === 429) {
          message = 'Слишком много запросов. Подождите немного и попробуйте снова.';
        } else if (!err.response) {
          message = 'Нет соединения с сервером. Проверьте интернет-подключение.';
        }
      }

      setError(message);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setLeadId(null);
  }, []);

  return { submit, status, error, leadId, reset };
}
