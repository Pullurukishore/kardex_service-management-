/**
 * Production-safe logger utility
 * Automatically disables console logs in production environment
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isProduction: boolean;
  private enableLogs: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    // Check if logs are explicitly enabled via environment variable
    this.enableLogs = process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true';
  }

  private shouldLog(level: LogLevel): boolean {
    // Always show errors and warnings
    if (level === 'error' || level === 'warn') {
      return true;
    }
    
    // In production, only log if explicitly enabled
    if (this.isProduction) {
      return this.enableLogs;
    }
    
    // In development, always log
    return true;
  }

  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log(...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...args);
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...args);
    }
  }

  table(data: any): void {
    if (this.shouldLog('log')) {
      console.table(data);
    }
  }

  group(label: string): void {
    if (this.shouldLog('log')) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.shouldLog('log')) {
      console.groupEnd();
    }
  }

  time(label: string): void {
    if (this.shouldLog('log')) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('log')) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export as default for easier migration
export default logger;
