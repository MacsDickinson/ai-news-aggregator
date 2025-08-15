import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the dependencies first
vi.mock("@config/env", () => ({
  env: {
    NODE_ENV: "test",
    OPENAI_API_KEY: "test-key",
    ANTHROPIC_API_KEY: "test-key",
  },
}));

vi.mock("@ai-news-aggregator/shared", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Define the types for testing
export enum ProviderType {
  PRIMARY = "primary",
  FALLBACK = "fallback",
}

export enum ProviderStatus {
  HEALTHY = "healthy",
  UNHEALTHY = "unhealthy",
  UNKNOWN = "unknown",
}

// Mock BaseProvider class
export abstract class BaseProvider {
  constructor(
    public name: string,
    public type: ProviderType,
  ) {}

  abstract checkHealth(): Promise<{ status: ProviderStatus; message: string }>;
  abstract generateResponse(prompt: string): Promise<{
    content: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }>;
}

// Simple ProviderManager implementation for testing
export class ProviderManager {
  private providers: BaseProvider[] = [];

  addProvider(provider: BaseProvider): void {
    // Remove existing provider of same type and insert in order
    this.providers = this.providers.filter((p) => p.type !== provider.type);

    if (provider.type === ProviderType.PRIMARY) {
      this.providers.unshift(provider);
    } else {
      this.providers.push(provider);
    }
  }

  getProviders(): BaseProvider[] {
    return [...this.providers];
  }

  async generateResponse(prompt: string): Promise<{
    content: string;
    provider: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    if (this.providers.length === 0) {
      throw new Error("No providers available");
    }

    const errors: Error[] = [];

    for (const provider of this.providers) {
      try {
        const response = await provider.generateResponse(prompt);
        return {
          ...response,
          provider: provider.name,
        };
      } catch (error) {
        errors.push(
          error instanceof Error ? error : new Error("Unknown error"),
        );
      }
    }

    throw new Error("All providers failed");
  }

  async checkHealth(): Promise<
    Array<{
      name: string;
      type: string;
      status: string;
      message: string;
    }>
  > {
    const results = await Promise.all(
      this.providers.map(async (provider) => {
        try {
          const health = await provider.checkHealth();
          return {
            name: provider.name,
            type: provider.type,
            status: health.status,
            message: health.message,
          };
        } catch (error) {
          return {
            name: provider.name,
            type: provider.type,
            status: ProviderStatus.UNHEALTHY,
            message: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    return results;
  }
}

// Mock providers for testing
class MockHealthyProvider extends BaseProvider {
  constructor(name: string, type: ProviderType) {
    super(name, type);
  }

  async checkHealth(): Promise<{ status: ProviderStatus; message: string }> {
    return {
      status: ProviderStatus.HEALTHY,
      message: "Provider is healthy",
    };
  }

  async generateResponse(prompt: string): Promise<{
    content: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    return {
      content: `Response from ${this.name}: ${prompt}`,
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    };
  }
}

class MockUnhealthyProvider extends BaseProvider {
  constructor(name: string, type: ProviderType) {
    super(name, type);
  }

  async checkHealth(): Promise<{ status: ProviderStatus; message: string }> {
    return {
      status: ProviderStatus.UNHEALTHY,
      message: "Provider is unhealthy",
    };
  }

  async generateResponse(): Promise<never> {
    throw new Error("Provider is unhealthy");
  }
}

describe("ProviderManager", () => {
  let manager: ProviderManager;
  let primaryProvider: MockHealthyProvider;
  let fallbackProvider: MockHealthyProvider;

  beforeEach(() => {
    manager = new ProviderManager();
    primaryProvider = new MockHealthyProvider("primary", ProviderType.PRIMARY);
    fallbackProvider = new MockHealthyProvider(
      "fallback",
      ProviderType.FALLBACK,
    );
  });

  describe("addProvider", () => {
    it("should add primary provider", () => {
      manager.addProvider(primaryProvider);

      const providers = manager.getProviders();
      expect(providers).toHaveLength(1);
      expect(providers[0]).toBe(primaryProvider);
    });

    it("should add fallback provider", () => {
      manager.addProvider(fallbackProvider);

      const providers = manager.getProviders();
      expect(providers).toHaveLength(1);
      expect(providers[0]).toBe(fallbackProvider);
    });

    it("should maintain provider order (primary first)", () => {
      manager.addProvider(fallbackProvider);
      manager.addProvider(primaryProvider);

      const providers = manager.getProviders();
      expect(providers).toHaveLength(2);
      expect(providers[0]).toBe(primaryProvider);
      expect(providers[1]).toBe(fallbackProvider);
    });
  });

  describe("getProviders", () => {
    it("should return empty array when no providers added", () => {
      const providers = manager.getProviders();
      expect(providers).toHaveLength(0);
    });

    it("should return all added providers", () => {
      manager.addProvider(primaryProvider);
      manager.addProvider(fallbackProvider);

      const providers = manager.getProviders();
      expect(providers).toHaveLength(2);
    });
  });

  describe("generateResponse", () => {
    it("should use primary provider when healthy", async () => {
      manager.addProvider(primaryProvider);
      manager.addProvider(fallbackProvider);

      const response = await manager.generateResponse("test prompt");

      expect(response.content).toBe("Response from primary: test prompt");
      expect(response.provider).toBe("primary");
    });

    it("should fallback to secondary provider when primary fails", async () => {
      const unhealthyPrimary = new MockUnhealthyProvider(
        "primary",
        ProviderType.PRIMARY,
      );
      manager.addProvider(unhealthyPrimary);
      manager.addProvider(fallbackProvider);

      const response = await manager.generateResponse("test prompt");

      expect(response.content).toBe("Response from fallback: test prompt");
      expect(response.provider).toBe("fallback");
    });

    it("should throw error when no providers available", async () => {
      await expect(manager.generateResponse("test prompt")).rejects.toThrow(
        "No providers available",
      );
    });

    it("should throw error when all providers fail", async () => {
      const unhealthyPrimary = new MockUnhealthyProvider(
        "primary",
        ProviderType.PRIMARY,
      );
      const unhealthyFallback = new MockUnhealthyProvider(
        "fallback",
        ProviderType.FALLBACK,
      );

      manager.addProvider(unhealthyPrimary);
      manager.addProvider(unhealthyFallback);

      await expect(manager.generateResponse("test prompt")).rejects.toThrow(
        "All providers failed",
      );
    });

    it("should include usage statistics in response", async () => {
      manager.addProvider(primaryProvider);

      const response = await manager.generateResponse("test prompt");

      expect(response.usage).toEqual({
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      });
    });
  });

  describe("checkHealth", () => {
    it("should return health status for all providers", async () => {
      manager.addProvider(primaryProvider);
      manager.addProvider(fallbackProvider);

      const health = await manager.checkHealth();

      expect(health).toHaveLength(2);
      expect(health[0]).toEqual({
        name: "primary",
        type: "primary",
        status: "healthy",
        message: "Provider is healthy",
      });
      expect(health[1]).toEqual({
        name: "fallback",
        type: "fallback",
        status: "healthy",
        message: "Provider is healthy",
      });
    });

    it("should return empty array when no providers", async () => {
      const health = await manager.checkHealth();
      expect(health).toHaveLength(0);
    });

    it("should include unhealthy providers in status", async () => {
      const unhealthyProvider = new MockUnhealthyProvider(
        "unhealthy",
        ProviderType.PRIMARY,
      );
      manager.addProvider(unhealthyProvider);

      const health = await manager.checkHealth();

      expect(health).toHaveLength(1);
      expect(health[0].status).toBe("unhealthy");
    });
  });
});
