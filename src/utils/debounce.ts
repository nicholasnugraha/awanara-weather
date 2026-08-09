/**
 * Debounce utility for search inputs and other real-time queries
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}

/**
 * Cancelable debounced fetch for API calls
 */
export function createCancelableDebounce<T>(delay: number) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return async <R>(key: string, fn: () => Promise<R>): Promise<R | undefined> => {
    if (timers.has(key)) {
      clearTimeout(timers.get(key));
    }

    return new Promise((resolve) => {
      timers.set(
        key,
        setTimeout(async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch {
            resolve(undefined);
          } finally {
            timers.delete(key);
          }
        }, delay)
      );
    });
  };
}
