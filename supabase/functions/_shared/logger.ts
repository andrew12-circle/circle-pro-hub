/**
 * Structured logging utility for edge functions
 * Provides consistent log format with correlation IDs for tracing
 */

export interface LogContext {
  correlationId: string;
  functionName: string;
  userId?: string;
  [key: string]: unknown;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Generate unique correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Create structured log entry
 */
export function log(
  level: LogLevel,
  message: string,
  context: LogContext,
  data?: Record<string, unknown>
): void {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
    ...data,
  };

  // Use appropriate console method based on level
  switch (level) {
    case "error":
      console.error(JSON.stringify(logEntry));
      break;
    case "warn":
      console.warn(JSON.stringify(logEntry));
      break;
    case "debug":
      console.debug(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

/**
 * Create logger instance for a function
 */
export function createLogger(functionName: string, correlationId?: string) {
  const ctx: LogContext = {
    correlationId: correlationId || generateCorrelationId(),
    functionName,
  };

  return {
    debug: (message: string, data?: Record<string, unknown>) =>
      log("debug", message, ctx, data),

    info: (message: string, data?: Record<string, unknown>) =>
      log("info", message, ctx, data),

    warn: (message: string, data?: Record<string, unknown>) =>
      log("warn", message, ctx, data),

    error: (message: string, data?: Record<string, unknown>) =>
      log("error", message, ctx, data),

    setUserId: (userId: string) => {
      ctx.userId = userId;
    },

    getContext: () => ({ ...ctx }),
  };
}

/**
 * Log API call timing
 */
export async function logTiming<T>(
  logger: ReturnType<typeof createLogger>,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    logger.info(`${operation} completed`, { duration, success: true });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error(`${operation} failed`, {
      duration,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    
    throw error;
  }
}
