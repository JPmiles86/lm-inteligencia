/**
 * Error Logging Service
 * Captures, categorizes, and logs errors for debugging and monitoring
 */

import { ErrorInfo } from 'react';

export enum ErrorCategory {
  REACT_ERROR = 'react_error',
  NETWORK_ERROR = 'network_error',
  PROVIDER_ERROR = 'provider_error',
  VALIDATION_ERROR = 'validation_error',
  AUTH_ERROR = 'auth_error',
  DATABASE_ERROR = 'database_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface BrowserInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  viewport: string;
  url: string;
  timestamp: string;
}

export interface ErrorLog {
  id: string;
  timestamp: Date;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  componentStack?: string;
  context?: {
    component?: string;
    action?: string;
    provider?: string;
    model?: string;
    userId?: string;
    sessionId?: string;
  };
  browserInfo: BrowserInfo;
  errorCount?: number;
  resolved?: boolean;
}

class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private errorQueue: ErrorLog[] = [];
  private sessionId: string;
  private errorCounts: Map<string, number> = new Map();
  private maxQueueSize = 50;
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBrowserInfo(): BrowserInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
  }

  private categorizeError(error: Error | string): ErrorCategory {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      return ErrorCategory.NETWORK_ERROR;
    }
    if (errorMessage.includes('Provider') || errorMessage.includes('AI') || errorMessage.includes('model')) {
      return ErrorCategory.PROVIDER_ERROR;
    }
    if (errorMessage.includes('Validation') || errorMessage.includes('Invalid')) {
      return ErrorCategory.VALIDATION_ERROR;
    }
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('auth')) {
      return ErrorCategory.AUTH_ERROR;
    }
    if (errorMessage.includes('Database') || errorMessage.includes('SQL')) {
      return ErrorCategory.DATABASE_ERROR;
    }
    if (errorMessage.includes('React')) {
      return ErrorCategory.REACT_ERROR;
    }
    return ErrorCategory.UNKNOWN_ERROR;
  }

  private determineSeverity(error: Error | string, category: ErrorCategory): ErrorSeverity {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Critical errors
    if (category === ErrorCategory.DATABASE_ERROR || errorMessage.includes('CRITICAL')) {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity
    if (category === ErrorCategory.AUTH_ERROR || category === ErrorCategory.PROVIDER_ERROR) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium severity
    if (category === ErrorCategory.NETWORK_ERROR || category === ErrorCategory.VALIDATION_ERROR) {
      return ErrorSeverity.MEDIUM;
    }
    
    return ErrorSeverity.LOW;
  }

  private getErrorKey(error: Error | string): string {
    const message = typeof error === 'string' ? error : error.message;
    // Create a simple hash of the error message for counting
    return message.substring(0, 50);
  }

  private incrementErrorCount(errorKey: string): number {
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);
    return count;
  }

  public logError(
    error: Error | string,
    errorInfo?: ErrorInfo,
    context?: ErrorLog['context']
  ): string {
    const errorKey = this.getErrorKey(error);
    const errorCount = this.incrementErrorCount(errorKey);
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(error, category);
    
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      category,
      severity,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      componentStack: errorInfo?.componentStack || undefined,
      context: {
        ...context,
        sessionId: this.sessionId,
      },
      browserInfo: this.getBrowserInfo(),
      errorCount,
      resolved: false,
    };

    // Add to queue
    this.errorQueue.push(errorLog);
    
    // Store in localStorage
    this.storeErrorLocally(errorLog);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Logged [${severity.toUpperCase()}]`);
      console.error('Message:', errorLog.message);
      console.log('Category:', category);
      console.log('Context:', context);
      if (errorLog.stack) console.log('Stack:', errorLog.stack);
      console.groupEnd();
    }

    // Trim queue if too large
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Send immediately if critical
    if (severity === ErrorSeverity.CRITICAL) {
      this.flush();
    }

    return errorLog.id;
  }

  private storeErrorLocally(errorLog: ErrorLog): void {
    try {
      const storedErrors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      storedErrors.push(errorLog);
      
      // Keep only last 100 errors
      if (storedErrors.length > 100) {
        storedErrors.splice(0, storedErrors.length - 100);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(storedErrors));
    } catch (e) {
      console.error('Failed to store error locally:', e);
    }
  }

  public async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // TODO: Send to API endpoint when available
      // await api.logErrors(errors);
      
      // For now, just log that we would send
      console.log(`Would send ${errors.length} errors to server`);
    } catch (error) {
      console.error('Failed to send errors to server:', error);
      // Re-add errors to queue
      this.errorQueue.unshift(...errors);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        undefined,
        { action: 'unhandledrejection' }
      );
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.logError(
        event.error || new Error(event.message),
        undefined,
        { 
          action: 'window.error',
          component: event.filename,
        }
      );
    });
  }

  public getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.errorQueue.slice(-limit);
  }

  public getErrorsByCategory(category: ErrorCategory): ErrorLog[] {
    return this.errorQueue.filter(error => error.category === category);
  }

  public getErrorsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.errorQueue.filter(error => error.severity === severity);
  }

  public clearErrors(): void {
    this.errorQueue = [];
    this.errorCounts.clear();
    localStorage.removeItem('errorLogs');
  }

  public markErrorResolved(errorId: string): void {
    const error = this.errorQueue.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  public getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      resolved: 0,
      unresolved: 0,
    };

    this.errorQueue.forEach(error => {
      // By category
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
      
      // By severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      
      // Resolved vs unresolved
      if (error.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }
    });

    return stats;
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Export singleton instance
export const errorLoggingService = ErrorLoggingService.getInstance();

// Helper functions for easy use
export const logError = (
  error: Error | string,
  context?: ErrorLog['context']
): string => {
  return errorLoggingService.logError(error, undefined, context);
};

export const logReactError = (
  error: Error,
  errorInfo: ErrorInfo,
  context?: ErrorLog['context']
): string => {
  return errorLoggingService.logError(error, errorInfo, context);
};