import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { StepIndicator } from './StepIndicator';
import { ContactInfo } from './ContactInfo';
import { BusinessInfo } from './BusinessInfo';
import { ProjectDetails } from './ProjectDetails';
import { Preferences } from './Preferences';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useLeadSubmit } from '../../hooks/useLeadSubmit';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useFormTracking } from '../../hooks/useFormTracking';
import { fetchFormConfigs } from '../../services/api';
import type { LeadFormData, LeadCreate } from '../../types/lead';
import { STEP_FIELDS, DEFAULT_NICHES, DEFAULT_BUDGETS, DEFAULT_TASK_TYPES } from '../../types/lead';
import type { FormConfigOptions, ServiceOption } from '../../types/api';
import { sanitizeInput } from '../../utils/validators';

const DRAFT_KEY = 'autovip_lead_draft';
const TOTAL_STEPS = 4;
const STEP_LABELS = ['Контакты', 'Бизнес', 'Проект', 'Связь'];

function loadDraft(): Partial<LeadFormData> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw) as Partial<LeadFormData>;
  } catch { /* corrupted draft */ }
  return {};
}

function toLeadCreate(data: LeadFormData): LeadCreate {
  return {
    first_name: sanitizeInput(data.first_name) || undefined,
    last_name: sanitizeInput(data.last_name) || undefined,
    middle_name: sanitizeInput(data.middle_name) || undefined,
    contact_phone: data.contact_phone.replace(/[^\d+]/g, ''),
    contact_email: data.contact_email || undefined,
    business_niche: data.business_niche,
    company_size: data.company_size,
    task_volume: sanitizeInput(data.task_volume),
    client_role: data.client_role,
    budget: data.budget,
    preferred_contact_method: data.preferred_contact_method,
    preferred_contact_time: sanitizeInput(data.preferred_contact_time),
    product_interest: sanitizeInput(data.product_interest),
    task_type: data.task_type,
    result_deadline: data.result_deadline,
    comments: sanitizeInput(data.comments) || undefined,
  };
}

export const LeadForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [configs, setConfigs] = useState<FormConfigOptions>({
    niches: DEFAULT_NICHES,
    budgets: DEFAULT_BUDGETS,
    taskTypes: DEFAULT_TASK_TYPES,
    services: [] as ServiceOption[],
  });
  const [configsLoading, setConfigsLoading] = useState(true);

  const draft = useMemo(() => loadDraft(), []);

  const methods = useForm<LeadFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      middle_name: '',
      contact_phone: '',
      contact_email: '',
      business_niche: '',
      company_size: '',
      task_volume: '',
      client_role: '',
      budget: '',
      preferred_contact_method: '',
      preferred_contact_time: '',
      product_interest: '',
      task_type: '',
      result_deadline: '',
      comments: '',
      ...draft,
    },
    mode: 'onBlur',
  });

  const { submit, status, error, reset: resetSubmit } = useLeadSubmit();
  const analytics = useAnalytics();
  const formTracking = useFormTracking();

  useEffect(() => {
    fetchFormConfigs()
      .then(setConfigs)
      .finally(() => setConfigsLoading(false));
  }, []);

  useEffect(() => {
    if (!configs.budgets.length) return;
    const currentBudget = methods.getValues('budget');
    if (!currentBudget) {
      methods.setValue('budget', configs.budgets[0]);
    }
  }, [configs.budgets, methods]);

  useEffect(() => {
    const interval = setInterval(() => {
      const values = methods.getValues();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    }, 5000);
    return () => clearInterval(interval);
  }, [methods]);

  const handleNext = useCallback(async () => {
    const fields = STEP_FIELDS[step];
    const isValid = await methods.trigger(fields);
    if (isValid) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step, methods]);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = useCallback(
    async (data: LeadFormData) => {
      const payload = toLeadCreate(data);
      const result = await submit(payload);
      if (result) {
        localStorage.removeItem(DRAFT_KEY);
        await analytics.send(result.id, formTracking.getData());
      }
    },
    [submit, analytics, formTracking]
  );

  const handleReset = useCallback(() => {
    methods.reset();
    setStep(1);
    resetSubmit();
    localStorage.removeItem(DRAFT_KEY);
  }, [methods, resetSubmit]);

  if (status === 'success') {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3 tracking-premium">
          Заявка отправлена!
        </h2>
        <p className="text-text-secondary max-w-md mx-auto mb-8">
          Спасибо за ваш интерес! Мы свяжемся с вами в ближайшее время
          выбранным вами способом связи.
        </p>
        <Button variant="outline" onClick={handleReset}>
          Отправить ещё одну заявку
        </Button>
      </div>
    );
  }

  if (configsLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" />
        <p className="text-center text-text-secondary mt-4">Загрузка формы...</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} noValidate>
        <StepIndicator current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
          {step === 1 && (
            <ContactInfo
              onFieldFocus={formTracking.onFieldFocus}
              onFieldBlur={formTracking.onFieldBlur}
            />
          )}
          {step === 2 && (
            <BusinessInfo
              nicheOptions={configs.niches}
              onFieldFocus={formTracking.onFieldFocus}
              onFieldBlur={formTracking.onFieldBlur}
            />
          )}
          {step === 3 && (
            <ProjectDetails
              budgetOptions={configs.budgets}
              taskTypeOptions={configs.taskTypes}
              services={configs.services}
              onFieldFocus={formTracking.onFieldFocus}
              onFieldBlur={formTracking.onFieldBlur}
            />
          )}
          {step === 4 && (
            <Preferences
              onFieldFocus={formTracking.onFieldFocus}
              onFieldBlur={formTracking.onFieldBlur}
            />
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake" role="alert">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-error">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <div>
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={handlePrev}>
                  Назад
                </Button>
              )}
            </div>
            <div>
              {step < TOTAL_STEPS ? (
                <Button type="button" onClick={handleNext}>
                  Далее
                </Button>
              ) : (
                <Button type="submit" loading={status === 'loading'} size="lg">
                  Отправить заявку
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
