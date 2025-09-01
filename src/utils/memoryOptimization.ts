/**
 * Memory Optimization Utilities
 * Helpers for preventing memory leaks and optimizing performance
 */

import { useEffect, useRef, useCallback, DependencyList } from 'react';

/**
 * Hook for managing AbortController with cleanup
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    controllerRef.current = new AbortController();
    
    return () => {
      controllerRef.current?.abort();
    };
  }, []);
  
  return controllerRef.current;
}

/**
 * Hook for fetch with automatic cancellation
 */
export function useFetch<T>(
  url: string,
  options?: RequestInit,
  deps: DependencyList = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      controller.abort();
    };
  }, deps);
  
  return { data, loading, error };
}

/**
 * Hook for interval with cleanup
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  deps: DependencyList = []
) {
  const savedCallback = useRef(callback);
  
  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Set up the interval
  useEffect(() => {
    if (delay === null) return;
    
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    
    return () => clearInterval(id);
  }, [delay, ...deps]);
}

/**
 * Hook for timeout with cleanup
 */
export function useTimeout(
  callback: () => void,
  delay: number | null,
  deps: DependencyList = []
) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setTimeout(() => savedCallback.current(), delay);
    
    return () => clearTimeout(id);
  }, [delay, ...deps]);
}

/**
 * Hook for event listener with cleanup
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement = window,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler);
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);
    
    element.addEventListener(eventName, eventListener, options);
    
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Hook for ResizeObserver with cleanup
 */
export function useResizeObserver(
  ref: React.RefObject<HTMLElement>,
  callback: (entry: ResizeObserverEntry) => void
) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        savedCallback.current(entries[0]);
      }
    });
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [ref]);
}

/**
 * Hook for IntersectionObserver with cleanup
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          savedCallback.current(entries[0].isIntersecting);
        }
      },
      options
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options?.root, options?.rootMargin, options?.threshold]);
}

/**
 * Debounce hook with cleanup
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Throttle hook with cleanup
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);
  
  return throttledValue;
}

/**
 * Memory-safe state that clears on unmount
 */
export function useSafeState<T>(initialState: T | (() => T)) {
  const [state, setState] = useState(initialState);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (isMountedRef.current) {
      setState(value);
    }
  }, []);
  
  return [state, setSafeState] as const;
}

/**
 * Cleanup function registry for complex components
 */
export class CleanupRegistry {
  private cleanups: (() => void)[] = [];
  
  register(cleanup: () => void) {
    this.cleanups.push(cleanup);
  }
  
  cleanup() {
    this.cleanups.forEach(fn => fn());
    this.cleanups = [];
  }
}

/**
 * Hook for cleanup registry
 */
export function useCleanupRegistry() {
  const registryRef = useRef(new CleanupRegistry());
  
  useEffect(() => {
    return () => {
      registryRef.current.cleanup();
    };
  }, []);
  
  return registryRef.current;
}

// Missing import
import { useState } from 'react';