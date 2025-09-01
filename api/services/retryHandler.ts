/**
 * Retry Handler with Exponential Backoff
 * 
 * Provides intelligent retry logic for AI provider failures with:
 * - Exponential backoff with jitter
 * - Configurable retry strategies
 * - Fallback chain support
 * - Provider health tracking integration
 */

interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  shouldRetry?: (error: any) => boolean;
}

interface FallbackResult<T> {
  result: T;
  provider: string;
  attempts: number;
  totalTime: number;
  errors: Array<{ provider: string; error: string; attempt: number }>;
}

export class RetryHandler {
  private readonly defaultOptions: RetryOptions = {
    maxAttempts: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 30000,    // 30 seconds max
    backoffMultiplier: 2,
    jitter: true,
    shouldRetry: (error) => {
      // Retry on network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        return true;
      }
      
      // Retry on 5xx server errors
      if (error.status >= 500 && error.status < 600) {
        return true;
      }
      
      // Retry on rate limiting (429)
      if (error.status === 429) {
        return true;
      }
      
      // Retry on specific OpenAI errors
      if (error.type === 'server_error' || error.type === 'timeout') {
        return true;
      }
      
      // Don't retry on 4xx client errors (except 429)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        return false;
      }
      
      // Don't retry on authentication errors
      if (error.status === 401 || error.status === 403) {
        return false;
      }
      
      // Retry on unknown errors (could be transient)
      return true;
    }
  };
  
  /**
   * Execute a function with retry logic and exponential backoff
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: any;
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        const result = await fn();
        
        // Log successful retry if it wasn't the first attempt
        if (attempt > 1) {
          console.log(`Operation succeeded on attempt ${attempt} after ${Date.now() - startTime}ms`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Log the attempt failure
        console.warn(`Attempt ${attempt} failed:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          status: error.status,
          code: error.code,
          type: error.type
        });
        
        // If this was the last attempt, break and throw
        if (attempt === opts.maxAttempts) {
          break;
        }
        
        // Check if we should retry this error
        if (!opts.shouldRetry!(error)) {
          console.log(`Not retrying error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
        
        // Calculate delay with exponential backoff and optional jitter
        const baseDelay = Math.min(
          opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
          opts.maxDelay
        );
        
        const delay = opts.jitter 
          ? baseDelay + Math.random() * baseDelay * 0.1 // Add up to 10% jitter
          : baseDelay;
        
        console.log(`Retrying in ${Math.round(delay)}ms... (attempt ${attempt}/${opts.maxAttempts})`);
        await this.sleep(delay);
      }
    }
    
    // All attempts failed
    const totalTime = Date.now() - startTime;
    console.error(`All ${opts.maxAttempts} attempts failed after ${totalTime}ms`);
    throw lastError;
  }
  
  /**
   * Execute with fallback providers
   */
  async executeWithFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackProviders: Array<{ provider: string; fn: () => Promise<T> }>,
    options?: Partial<RetryOptions>
  ): Promise<FallbackResult<T>> {
    const startTime = Date.now();
    let totalAttempts = 0;
    const errors: Array<{ provider: string; error: string; attempt: number }> = [];
    
    // Try primary provider first
    try {
      totalAttempts++;
      const result = await this.executeWithRetry(primaryFn, {
        ...options,
        maxAttempts: options?.maxAttempts || 2 // Fewer retries for primary to fail faster to fallback
      });
      
      return {
        result,
        provider: 'primary',
        attempts: totalAttempts,
        totalTime: Date.now() - startTime,
        errors
      };
    } catch (primaryError) {
      errors.push({
        provider: 'primary',
        error: primaryError instanceof Error ? primaryError.message : 'Unknown error',
        attempt: totalAttempts
      });
      console.error('Primary provider failed, trying fallbacks:', primaryError instanceof Error ? primaryError.message : 'Unknown error');
    }
    
    // Try fallback providers in order
    for (const fallback of fallbackProviders) {
      try {
        totalAttempts++;
        const result = await this.executeWithRetry(fallback.fn, {
          ...options,
          maxAttempts: 2 // Fewer retries for fallbacks to move through chain faster
        });
        
        console.log(`Fallback provider '${fallback.provider}' succeeded after primary failure`);
        
        return {
          result,
          provider: fallback.provider,
          attempts: totalAttempts,
          totalTime: Date.now() - startTime,
          errors
        };
      } catch (fallbackError) {
        errors.push({
          provider: fallback.provider,
          error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
          attempt: totalAttempts
        });
        console.error(`Fallback provider '${fallback.provider}' failed:`, fallbackError instanceof Error ? fallbackError.message : 'Unknown error');
      }
    }
    
    // All providers failed
    const totalTime = Date.now() - startTime;
    const errorMessage = `All providers failed after ${totalAttempts} attempts in ${totalTime}ms. Errors: ${errors.map(e => `${e.provider}: ${e.error}`).join('; ')}`;
    
    throw new Error(errorMessage);
  }
  
  /**
   * Batch retry with circuit breaker pattern
   */
  async executeWithCircuitBreaker<T>(
    fn: () => Promise<T>,
    circuitBreakerKey: string,
    options?: Partial<RetryOptions & {
      failureThreshold: number;
      resetTimeout: number;
    }>
  ): Promise<T> {
    const circuitOptions = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      ...options
    };
    
    // Simple in-memory circuit breaker (in production, use Redis or similar)
    const circuitState = this.getCircuitState(circuitBreakerKey);
    
    // Check if circuit is open
    if (circuitState.isOpen && Date.now() - circuitState.lastFailureTime < circuitOptions.resetTimeout) {
      throw new Error(`Circuit breaker is open for ${circuitBreakerKey}. Try again later.`);
    }
    
    try {
      const result = await this.executeWithRetry(fn, options);
      
      // Reset circuit breaker on success
      this.resetCircuit(circuitBreakerKey);
      
      return result;
    } catch (error) {
      // Record failure
      this.recordCircuitFailure(circuitBreakerKey, circuitOptions.failureThreshold);
      throw error;
    }
  }
  
  /**
   * Retry with custom backoff strategy
   */
  async executeWithCustomBackoff<T>(
    fn: () => Promise<T>,
    backoffStrategy: (attempt: number) => number,
    maxAttempts: number = 3
  ): Promise<T> {
    let lastError: any;
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        
        if (attempt > 1) {
          console.log(`Custom backoff succeeded on attempt ${attempt} after ${Date.now() - startTime}ms`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          break;
        }
        
        if (!this.defaultOptions.shouldRetry!(error)) {
          throw error;
        }
        
        const delay = backoffStrategy(attempt);
        console.log(`Custom backoff: retrying in ${delay}ms... (attempt ${attempt}/${maxAttempts})`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
  
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Simple in-memory circuit breaker (replace with persistent storage in production)
  private circuitStates: Map<string, { failures: number; isOpen: boolean; lastFailureTime: number }> = new Map();
  
  private getCircuitState(key: string) {
    return this.circuitStates.get(key) || { failures: 0, isOpen: false, lastFailureTime: 0 };
  }
  
  private recordCircuitFailure(key: string, threshold: number) {
    const state = this.getCircuitState(key);
    state.failures++;
    state.lastFailureTime = Date.now();
    
    if (state.failures >= threshold) {
      state.isOpen = true;
      console.warn(`Circuit breaker opened for ${key} after ${state.failures} failures`);
    }
    
    this.circuitStates.set(key, state);
  }
  
  private resetCircuit(key: string) {
    const state = { failures: 0, isOpen: false, lastFailureTime: 0 };
    this.circuitStates.set(key, state);
  }
}

/**
 * Pre-configured retry strategies
 */
export const RetryStrategies = {
  // Conservative strategy for production
  conservative: {
    maxAttempts: 2,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true
  },
  
  // Aggressive strategy for critical operations
  aggressive: {
    maxAttempts: 5,
    initialDelay: 500,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
    jitter: true
  },
  
  // Fast strategy for real-time operations
  fast: {
    maxAttempts: 3,
    initialDelay: 200,
    maxDelay: 2000,
    backoffMultiplier: 2,
    jitter: false
  },
  
  // Patient strategy for batch operations
  patient: {
    maxAttempts: 10,
    initialDelay: 2000,
    maxDelay: 60000,
    backoffMultiplier: 1.5,
    jitter: true
  }
};

// Export singleton instance
export const retryHandler = new RetryHandler();