import { env } from "@config/env";

/**
 * Base interface for all AI providers
 */
export interface AIProvider {
  name: string;
  isHealthy(): Promise<boolean>;
  getStatus(): Promise<ProviderStatus>;
}

/**
 * Provider status information
 */
export interface ProviderStatus {
  name: string;
  healthy: boolean;
  latency?: number;
  lastCheck: Date;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Provider health check result
 */
export interface HealthCheckResult {
  success: boolean;
  latency: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Base abstract class for AI providers
 */
export abstract class BaseAIProvider implements AIProvider {
  public readonly name: string;
  protected lastHealthCheck: Date = new Date();
  protected lastHealthResult: HealthCheckResult | null = null;
  protected healthCheckInterval: number = 60000; // 1 minute

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Perform a health check
   */
  abstract performHealthCheck(): Promise<HealthCheckResult>;

  /**
   * Check if the provider is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.performHealthCheck();
      this.lastHealthCheck = new Date();
      this.lastHealthResult = result;
      return result.success;
    } catch (error) {
      this.lastHealthResult = {
        success: false,
        latency: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
      return false;
    }
  }

  /**
   * Get provider status
   */
  async getStatus(): Promise<ProviderStatus> {
    // Use cached result if recent
    const now = new Date();
    const timeSinceCheck = now.getTime() - this.lastHealthCheck.getTime();

    if (!this.lastHealthResult || timeSinceCheck > this.healthCheckInterval) {
      await this.isHealthy();
    }

    return {
      name: this.name,
      healthy: this.lastHealthResult?.success ?? false,
      ...(this.lastHealthResult?.latency !== undefined && {
        latency: this.lastHealthResult.latency,
      }),
      lastCheck: this.lastHealthCheck,
      ...(this.lastHealthResult?.error && {
        error: this.lastHealthResult.error,
      }),
      ...(this.lastHealthResult?.metadata && {
        metadata: this.lastHealthResult.metadata,
      }),
    };
  }

  /**
   * Measure execution time of an async function
   */
  protected async measureLatency<T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; latency: number }> {
    const start = Date.now();
    const result = await fn();
    const latency = Date.now() - start;
    return { result, latency };
  }

  /**
   * Retry logic with exponential backoff
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxAttempts) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

/**
 * Provider error types
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number,
    public cause?: Error,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export class ProviderRateLimitError extends ProviderError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${provider}`, provider, 429);
    this.name = "ProviderRateLimitError";
  }
}

export class ProviderAuthError extends ProviderError {
  constructor(provider: string) {
    super(`Authentication failed for ${provider}`, provider, 401);
    this.name = "ProviderAuthError";
  }
}

export class ProviderServiceError extends ProviderError {
  constructor(provider: string, cause?: Error) {
    super(`Service error for ${provider}`, provider, 500, cause);
    this.name = "ProviderServiceError";
  }
}
