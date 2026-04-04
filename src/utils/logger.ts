import { getCurrentCorrelationId } from './correlationId';

type LogLevel = 'info' | 'warn' | 'error';
type LogLevelThreshold = LogLevel | null;

interface LogContext {
  minLogLevel: LogLevelThreshold;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  info: 0,
  warn: 1,
  error: 2,
};

function parseMinLogLevel(value: string | undefined): LogLevelThreshold {
  if (!value) {
    return __DEV__ ? 'info' : 'warn';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'info' || normalized === 'warn' || normalized === 'error') {
    return normalized;
  }

  if (normalized === 'log') {
    return 'info';
  }

  if (normalized === 'none' || normalized === 'false') {
    return null;
  }

  return __DEV__ ? 'info' : 'warn';
}

function shouldLog(level: LogLevel): boolean {
  const minLogLevel = logContext.minLogLevel;
  if (!minLogLevel) {
    return false;
  }

  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLogLevel];
}

const logContext: LogContext = {
  minLogLevel: parseMinLogLevel(process.env.EXPO_PUBLIC_LOG_LEVEL),
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
function formatLogMessage(level: LogLevel, message: string, data?: string): string {
  const correlationId = getCurrentCorrelationId();
  const baseMsg = `[${correlationId}] [${level}] ${message}`;
  return data ? `${baseMsg} ${data}` : baseMsg;
}

/**
 * Log a message if logging is enabled
 */
export function logMessage(level: LogLevel, message: string, data?: string): void {
  if (!shouldLog(level)) {
    return;
  }

  const formattedMsg = formatLogMessage(level, message, data);

  if (level === 'info') {
    console.log(formattedMsg);
  } else if (level === 'warn') {
    console.warn(formattedMsg);
  } else if (level === 'error') {
    console.error(formattedMsg);
  }
}
