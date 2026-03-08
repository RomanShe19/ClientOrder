import React from 'react';

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total, labels }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          const isActive = step === current;
          const isCompleted = step < current;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300
                    ${isCompleted ? 'bg-success text-white' : ''}
                    ${isActive ? 'bg-accent text-white ring-4 ring-accent/20' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-text-secondary' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={`
                    text-xs mt-2 text-center hidden sm:block max-w-[80px]
                    ${isActive ? 'text-accent font-semibold' : 'text-text-secondary'}
                  `}
                >
                  {labels[i]}
                </span>
              </div>
              {step < total && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="h-0.5 bg-gray-200 relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-success transition-all duration-500"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="sm:hidden text-center">
        <span className="text-sm text-text-secondary">
          Шаг {current} из {total}: <span className="font-medium text-text-primary">{labels[current - 1]}</span>
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
        <div
          className="bg-accent h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((current - 1) / (total - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};
