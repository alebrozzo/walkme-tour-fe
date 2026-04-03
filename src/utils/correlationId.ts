/**
 * Generates a unique correlation ID for tracking requests across client and server
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

/**
 * Store current correlation ID in memory
 */
let currentCorrelationId: string = generateCorrelationId();

export function setCurrentCorrelationId(id: string): void {
  currentCorrelationId = id;
}

export function getCurrentCorrelationId(): string {
  return currentCorrelationId;
}

/**
 * Reset to generate a new correlation ID (typically called on app init or navigation)
 */
export function resetCorrelationId(): void {
  currentCorrelationId = generateCorrelationId();
}
