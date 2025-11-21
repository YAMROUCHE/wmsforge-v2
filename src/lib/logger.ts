/**
 * Production-safe logger utility
 *
 * Replaces console.log/warn/error with environment-aware logging.
 * In production, logs are sent to monitoring service instead of console.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Log informational message
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown): void {
    this.log('error', message, error);

    // In production, send to monitoring service
    if (!this.isDevelopment && error instanceof Error) {
      this.sendToMonitoring({
        level: 'error',
        message,
        data: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      // eslint-disable-next-line no-console
      console[logMethod](`[${level.toUpperCase()}] ${message}`, data || '');
    } else {
      // In production, send to monitoring service
      this.sendToMonitoring(logEntry);
    }
  }

  private sendToMonitoring(entry: LogEntry): void {
    // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
    // For now, just store in sessionStorage for debugging
    try {
      const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }
      sessionStorage.setItem('app_logs', JSON.stringify(logs));
    } catch {
      // Silently fail if sessionStorage is not available
    }
  }
}

// Export singleton instance
export const logger = new Logger();
