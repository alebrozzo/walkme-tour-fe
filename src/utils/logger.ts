import { getCurrentCorrelationId } from './correlationId';

type LogLevel = 'log' | 'warn' | 'error';

interface LogContext {
  enableLogging: boolean;
}

const logContext: LogContext = {
  enableLogging: false,
};

/**
 * Set logging context globally (called from app initialization)
 */
export function setLoggingContext(context: Partial<LogContext>): void {
  Object.assign(logContext, context);
}

/**
 * Format log message with correlation ID and optional context
 */
function formatLogMessage(message: string, data?: Record<string, unknown>): string {
  const correlationId = getCurrentCorrelationId();
  const baseMsg = `[${correlationId}] ${message}`;

  if (data && Object.keys(data).length > 0) {
    return `${baseMsg} ${JSON.stringify(data)}`;
  }

  return baseMsg;
}

/**
 * Log a message if logging is enabled
 */
export function logMessage(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  if (!logContext.enableLogging) {
    return;
  }

  const formattedMsg = formatLogMessage(message, data);

  if (level === 'log') {
    console.log(formattedMsg);
  } else if (level === 'warn') {
    console.warn(formattedMsg);
  } else if (level === 'error') {
    console.error(formattedMsg);
  }
}
