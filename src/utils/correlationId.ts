/**
 * Generates a unique correlation ID for tracking requests across client and server
 */
export function generateCorrelationId(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
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
