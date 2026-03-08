import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../ui/Input';
import type { LeadFormData } from '../../types/lead';
import { validatePhone, validateEmail, validateRequired, formatPhoneInput } from '../../utils/validators';

interface ContactInfoProps {
  onFieldFocus: (name: string) => void;
  onFieldBlur: (name: string) => void;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ onFieldFocus, onFieldBlur }) => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<LeadFormData>();

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneInput(e.target.value);
      setValue('contact_phone', formatted, { shouldValidate: true });
    },
    [setValue]
  );

  const trackingHandlers = (name: keyof LeadFormData) => ({
    onFocus: () => onFieldFocus(name),
    onBlur: () => onFieldBlur(name),
  });

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary tracking-premium">Контактные данные</h2>
        <p className="text-sm text-text-secondary mt-1">Как мы можем с вами связаться</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Имя"
          placeholder="Иван"
          error={errors.first_name?.message}
          {...register('first_name', { validate: validateRequired('Имя') })}
          {...trackingHandlers('first_name')}
        />
        <Input
          label="Фамилия"
          placeholder="Иванов"
          error={errors.last_name?.message}
          {...register('last_name', { validate: validateRequired('Фамилия') })}
          {...trackingHandlers('last_name')}
        />
      </div>

      <Input
        label="Отчество"
        placeholder="Иванович"
        optional
        error={errors.middle_name?.message}
        {...register('middle_name')}
        {...trackingHandlers('middle_name')}
      />

      <Input
        label="Телефон"
        type="tel"
        placeholder="+7 (999) 123-45-67"
        prefix="+7"
        error={errors.contact_phone?.message}
        {...register('contact_phone', { validate: validatePhone, onChange: handlePhoneChange })}
        {...trackingHandlers('contact_phone')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="ivan@company.ru"
        optional
        error={errors.contact_email?.message}
        {...register('contact_email', { validate: validateEmail })}
        {...trackingHandlers('contact_email')}
      />
    </div>
  );
};
