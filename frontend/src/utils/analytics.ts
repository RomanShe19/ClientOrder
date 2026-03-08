type ThrottledFn<T extends unknown[]> = (...args: T) => void;

export function throttle<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
): ThrottledFn<T> {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: T) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}

export function getGridZone(x: number, y: number, cols: number = 10, rows: number = 10): string {
  const col = Math.min(Math.floor((x / window.innerWidth) * cols), cols - 1);
  const row = Math.min(Math.floor((y / window.innerHeight) * rows), rows - 1);
  return `${row}_${col}`;
}

export function getReturnVisits(): number {
  const key = 'autovip_visits';
  const count = parseInt(sessionStorage.getItem(key) || '0', 10);
  sessionStorage.setItem(key, String(count + 1));
  return count;
}
