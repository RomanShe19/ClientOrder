import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { LeadFormData } from '../../types/lead';
import { DEADLINE_OPTIONS } from '../../types/lead';
import type { ServiceOption } from '../../types/api';
import { validateRequired } from '../../utils/validators';

interface ProjectDetailsProps {
  budgetOptions: string[];
  taskTypeOptions: string[];
  services: ServiceOption[];
  onFieldFocus: (name: string) => void;
  onFieldBlur: (name: string) => void;
}

function formatPrice(value: number): string {
  return value.toLocaleString('ru-RU') + ' ₽';
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  budgetOptions,
  taskTypeOptions,
  services,
  onFieldFocus,
  onFieldBlur,
}) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<LeadFormData>();

  const selectedTaskType = watch('task_type');

  const selectedService = useMemo(
    () => services.find((s) => s.name === selectedTaskType) ?? null,
    [services, selectedTaskType]
  );

  const hasDynamicBudget = selectedService && selectedService.priceMax > 0;
  const budgetMin = selectedService?.priceMin ?? 0;
  const budgetMax = selectedService?.priceMax ?? 0;

  const currentBudget = watch('budget');

  const numericBudget = useMemo(() => {
    const n = parseInt(currentBudget?.replace(/\D/g, '') || '0', 10);
    if (hasDynamicBudget) {
      return Math.max(budgetMin, Math.min(n || budgetMin, budgetMax));
    }
    return n;
  }, [currentBudget, hasDynamicBudget, budgetMin, budgetMax]);

  const [sliderValue, setSliderValue] = useState(numericBudget);

  useEffect(() => {
    if (hasDynamicBudget) {
      const clamped = Math.max(budgetMin, Math.min(numericBudget, budgetMax));
      setSliderValue(clamped);
    }
  }, [hasDynamicBudget, numericBudget, budgetMin, budgetMax]);

  useEffect(() => {
    if (hasDynamicBudget) {
      setSliderValue(budgetMin);
      setValue('budget', formatPrice(budgetMin), { shouldValidate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaskType]);

  const handleDynamicSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setSliderValue(val);
      setValue('budget', formatPrice(val), { shouldValidate: true });
    },
    [setValue]
  );

  // Fallback: discrete budget options (when no service selected or services unavailable)
  const budgetIndex = useMemo(() => {
    const idx = budgetOptions.indexOf(currentBudget);
    return idx >= 0 ? idx : 0;
  }, [currentBudget, budgetOptions]);

  const [discreteSlider, setDiscreteSlider] = useState(budgetIndex);

  useEffect(() => {
    setDiscreteSlider(budgetIndex);
  }, [budgetIndex]);

  const handleDiscreteSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = Number(e.target.value);
      setDiscreteSlider(idx);
      setValue('budget', budgetOptions[idx], { shouldValidate: true });
    },
    [setValue, budgetOptions]
  );

  const hasServices = services.length > 0;

  const taskTypeSelectOptions = hasServices
    ? services.map((s) => ({ value: s.name, label: s.name }))
    : taskTypeOptions.map((t) => ({ value: t, label: t }));

  const trackingHandlers = (name: keyof LeadFormData) => ({
    onFocus: () => onFieldFocus(name),
    onBlur: () => onFieldBlur(name),
  });

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary tracking-premium">Детали проекта</h2>
        <p className="text-sm text-text-secondary mt-1">Выберите услугу и параметры</p>
      </div>

      {/* Service selection cards (when services loaded from DB) */}
      {hasServices ? (
        <div onFocus={() => onFieldFocus('task_type')} onBlur={() => onFieldBlur('task_type')}>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Выберите услугу
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((service) => {
              const isSelected = selectedTaskType === service.name;
              return (
                <button
                  key={service.key}
                  type="button"
                  onClick={() => {
                    setValue('task_type', service.name, { shouldValidate: true });
                    setValue('product_interest', service.name, { shouldValidate: true });
                  }}
                  className={`
                    text-left p-4 rounded-xl border-2 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                    ${isSelected
                      ? 'border-accent bg-accent-light shadow-card'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-subtle'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                      {service.name}
                    </h3>
                    {isSelected && (
                      <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mb-3 line-clamp-2">{service.description}</p>
                  <p className="text-sm font-medium text-text-primary">
                    {formatPrice(service.priceMin)} — {formatPrice(service.priceMax)}
                  </p>
                  <p className="text-xs text-text-secondary">{service.unit}</p>
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register('task_type', { validate: validateRequired('Услуга') })} />
          {errors.task_type?.message && (
            <p className="text-sm text-error mt-2" role="alert">{errors.task_type.message}</p>
          )}
        </div>
      ) : (
        <Select
          label="Тип задачи"
          options={taskTypeSelectOptions}
          placeholder="Выберите тип задачи..."
          error={errors.task_type?.message}
          {...register('task_type', { validate: validateRequired('Тип задачи') })}
          {...trackingHandlers('task_type')}
        />
      )}

      {/* Budget slider — dynamic when service selected, discrete fallback otherwise */}
      <div onFocus={() => onFieldFocus('budget')} onBlur={() => onFieldBlur('budget')}>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Бюджет</label>
        <div className="bg-secondary rounded-xl p-5">
          {hasDynamicBudget ? (
            <>
              <div className="text-center mb-4">
                <span className="text-lg font-bold text-accent">{formatPrice(sliderValue)}</span>
              </div>
              <input
                type="range"
                min={budgetMin}
                max={budgetMax}
                step={Math.max(1000, Math.round((budgetMax - budgetMin) / 50))}
                value={sliderValue}
                onChange={handleDynamicSlider}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-accent
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-card [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-accent
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-card"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-text-secondary">{formatPrice(budgetMin)}</span>
                <span className="text-xs text-text-secondary">{formatPrice(budgetMax)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <span className="text-lg font-bold text-accent">
                  {budgetOptions[discreteSlider] || budgetOptions[0]}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={budgetOptions.length - 1}
                value={discreteSlider}
                onChange={handleDiscreteSlider}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-accent
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-card [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-accent
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-card"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-text-secondary">{budgetOptions[0]}</span>
                <span className="text-xs text-text-secondary">{budgetOptions[budgetOptions.length - 1]}</span>
              </div>
            </>
          )}
        </div>
        <input type="hidden" {...register('budget', { validate: validateRequired('Бюджет') })} />
        {errors.budget?.message && (
          <p className="text-sm text-error mt-1" role="alert">{errors.budget.message}</p>
        )}
      </div>

      {/* Product interest — hidden if auto-filled from service, visible otherwise */}
      {!hasServices && (
        <Input
          label="Интересующий продукт"
          placeholder="Например: полировка кузова"
          error={errors.product_interest?.message}
          {...register('product_interest', { validate: validateRequired('Интересующий продукт') })}
          {...trackingHandlers('product_interest')}
        />
      )}

      <Select
        label="Срок результата"
        options={DEADLINE_OPTIONS}
        placeholder="Выберите срок..."
        error={errors.result_deadline?.message}
        {...register('result_deadline', { validate: validateRequired('Срок результата') })}
        {...trackingHandlers('result_deadline')}
      />
    </div>
  );
};
