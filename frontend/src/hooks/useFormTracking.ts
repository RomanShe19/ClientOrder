import { useRef, useCallback } from 'react';

export function useFormTracking() {
  const fieldTimes = useRef<Record<string, number>>({});
  const fieldOrder = useRef<string[]>([]);
  const focusStart = useRef<Record<string, number>>({});

  const onFieldFocus = useCallback((fieldName: string) => {
    focusStart.current[fieldName] = Date.now();

    if (!fieldOrder.current.includes(fieldName)) {
      fieldOrder.current.push(fieldName);
    }
  }, []);

  const onFieldBlur = useCallback((fieldName: string) => {
    const start = focusStart.current[fieldName];
    if (start) {
      const elapsed = Date.now() - start;
      fieldTimes.current[fieldName] = (fieldTimes.current[fieldName] || 0) + elapsed;
      delete focusStart.current[fieldName];
    }
  }, []);

  const getData = useCallback(() => ({
    fieldTimes: { ...fieldTimes.current },
    fieldOrder: [...fieldOrder.current],
  }), []);

  return { onFieldFocus, onFieldBlur, getData };
}
