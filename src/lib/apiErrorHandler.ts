/**
 * Centralized API error handling and payload size management
 * Prevents timeouts and ambiguous "saved but timed out" states
 */

export const MAX_JSON_SIZE = 1024 * 1024; // 1MB
export const API_TIMEOUT = 30000; // 30 seconds

export interface ApiCallOptions {
  timeout?: number;
  maxSize?: number;
  onTimeout?: () => void;
}

export interface ApiResult<T> {
  data?: T;
  error?: string;
  timedOut?: boolean;
}

/**
 * Safely execute an API call with timeout and error handling
 */
export async function safeApiCall<T>(
  fn: () => Promise<T>,
  options: ApiCallOptions = {}
): Promise<ApiResult<T>> {
  const timeout = options.timeout || API_TIMEOUT;

  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => {
          if (options.onTimeout) {
            options.onTimeout();
          }
          reject(new Error("Request timeout"));
        }, timeout)
      ),
    ]);

    return { data: result };
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === "Request timeout";
    
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timedOut: isTimeout,
    };
  }
}

/**
 * Validate JSON payload size before sending
 */
export function validatePayloadSize(
  data: unknown,
  maxSize: number = MAX_JSON_SIZE
): { valid: boolean; size: number; error?: string } {
  const json = JSON.stringify(data);
  const size = new Blob([json]).size;

  if (size > maxSize) {
    return {
      valid: false,
      size,
      error: `Payload size (${Math.round(size / 1024)}KB) exceeds maximum allowed size (${Math.round(maxSize / 1024)}KB)`,
    };
  }

  return { valid: true, size };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error: string, status: number = 500) {
  return {
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle async operations with loading state
 */
export async function withLoadingState<T>(
  fn: () => Promise<T>,
  setLoading: (loading: boolean) => void
): Promise<ApiResult<T>> {
  setLoading(true);
  try {
    const result = await safeApiCall(fn);
    return result;
  } finally {
    setLoading(false);
  }
}
