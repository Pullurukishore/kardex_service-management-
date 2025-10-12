/**
 * Console wrapper that disables console.log in production
 * This allows existing code to continue using console.log without changes
 * while automatically disabling it in production
 */

import { logger } from './logger';

const isProduction = process.env.NODE_ENV === 'production';
const enableConsoleLogs = process.env.ENABLE_CONSOLE_LOGS === 'true';

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

/**
 * Override console methods to use winston logger in production
 */
export function disableConsoleInProduction() {
  if (isProduction && !enableConsoleLogs) {
    // Redirect console.log to winston logger
    console.log = (...args: any[]) => {
      // Silent in production unless explicitly enabled
    };

    console.info = (...args: any[]) => {
      // Silent in production unless explicitly enabled
    };

    console.debug = (...args: any[]) => {
      // Silent in production unless explicitly enabled
    };

    // Keep warnings and errors
    console.warn = (...args: any[]) => {
      logger.warn(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
    };

    console.error = (...args: any[]) => {
      logger.error(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
    };
  }
}

/**
 * Restore original console methods (useful for testing)
 */
export function restoreConsole() {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
}

// Auto-disable on import in production
if (isProduction && !enableConsoleLogs) {
  disableConsoleInProduction();
}
