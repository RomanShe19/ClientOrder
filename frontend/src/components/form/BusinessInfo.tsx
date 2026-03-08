import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import type { LeadFormData } from '../../types/lead';
import { COMPANY_SIZE_OPTIONS, CLIENT_ROLE_OPTIONS } from '../../types/lead';
import { validateRequired } from '../../utils/validators';

interface BusinessInfoProps {
  nicheOptions: string[];
  onFieldFocus: (name: string) => void;
  onFieldBlur: (name: string) => void;
}

export const BusinessInfo: React.FC<BusinessInfoProps> = ({
  nicheOptions,
  onFieldFocus,
  onFieldBlur,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<LeadFormData>();

  const trackingHandlers = (name: keyof LeadFormData) => ({
    onFocus: () => onFieldFocus(name),
    onBlur: () => onFieldBlur(name),
  });

  const nicheSelectOptions = nicheOptions.map((n) => ({ value: n, label: n }));

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary tracking-premium">Информация о бизнесе</h2>
        <p className="text-sm text-text-secondary mt-1">Расскажите о вашей компании</p>
      </div>

      <Select
        label="Ниша бизнеса"
        options={nicheSelectOptions}
        placeholder="Выберите нишу..."
        error={errors.business_niche?.message}
        {...register('business_niche', { validate: validateRequired('Ниша бизнеса') })}
        {...trackingHandlers('business_niche')}
      />

      <Select
        label="Размер компании"
        options={COMPANY_SIZE_OPTIONS}
        placeholder="Выберите размер..."
        error={errors.company_size?.message}
        {...register('company_size', { validate: validateRequired('Размер компании') })}
        {...trackingHandlers('company_size')}
      />

      <Textarea
        label="Объём задачи"
        placeholder="Опишите масштаб и объём вашей задачи..."
        error={errors.task_volume?.message}
        {...register('task_volume', { validate: validateRequired('Объём задачи') })}
        {...trackingHandlers('task_volume')}
      />

      <Select
        label="Кто вы"
        options={CLIENT_ROLE_OPTIONS}
        placeholder="Выберите роль..."
        error={errors.client_role?.message}
        {...register('client_role', { validate: validateRequired('Кто вы') })}
        {...trackingHandlers('client_role')}
      />
    </div>
  );
};
