import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import type { LeadFormData } from '../../types/lead';
import { CONTACT_METHOD_OPTIONS } from '../../types/lead';
import { validateRequired } from '../../utils/validators';

interface PreferencesProps {
  onFieldFocus: (name: string) => void;
  onFieldBlur: (name: string) => void;
}

export const Preferences: React.FC<PreferencesProps> = ({ onFieldFocus, onFieldBlur }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<LeadFormData>();

  const trackingHandlers = (name: keyof LeadFormData) => ({
    onFocus: () => onFieldFocus(name),
    onBlur: () => onFieldBlur(name),
  });

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary tracking-premium">Предпочтения связи</h2>
        <p className="text-sm text-text-secondary mt-1">Как и когда вам удобно получить ответ</p>
      </div>

      <Select
        label="Удобный способ связи"
        options={CONTACT_METHOD_OPTIONS}
        placeholder="Выберите способ..."
        error={errors.preferred_contact_method?.message}
        {...register('preferred_contact_method', {
          validate: validateRequired('Способ связи'),
        })}
        {...trackingHandlers('preferred_contact_method')}
      />

      <Input
        label="Удобное время"
        placeholder="Например: 10:00–18:00 по МСК"
        error={errors.preferred_contact_time?.message}
        {...register('preferred_contact_time', {
          validate: validateRequired('Удобное время'),
        })}
        {...trackingHandlers('preferred_contact_time')}
      />

      <Textarea
        label="Комментарии"
        placeholder="Любая дополнительная информация, которая поможет нам подготовить предложение..."
        optional
        {...register('comments')}
        {...trackingHandlers('comments')}
      />

      <div className="bg-accent-light rounded-xl p-4 mt-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-accent">Защита данных</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Нажимая «Отправить», вы соглашаетесь с обработкой персональных данных.
              Мы не передаём информацию третьим лицам.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
