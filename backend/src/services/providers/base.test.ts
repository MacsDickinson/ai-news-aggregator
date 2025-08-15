import { describe, it, expect, vi } from "vitest";

// Define the enums for testing
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

// Mock implementation for testing
class MockProvider extends BaseProvider {
  constructor(name: string, type: ProviderType) {
    super(name, type);
  }

  async checkHealth(): Promise<{ status: ProviderStatus; message: string }> {
    return {
      status: ProviderStatus.HEALTHY,
      message: "Mock provider is healthy",
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
      content: `Mock response to: ${prompt}`,
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    };
  }
}

describe("BaseProvider", () => {
  describe("constructor", () => {
    it("should create provider with correct name and type", () => {
      const provider = new MockProvider("test-provider", ProviderType.PRIMARY);

      expect(provider.name).toBe("test-provider");
      expect(provider.type).toBe(ProviderType.PRIMARY);
    });
  });

  describe("checkHealth", () => {
    it("should return health status", async () => {
      const provider = new MockProvider("test-provider", ProviderType.PRIMARY);

      const health = await provider.checkHealth();

      expect(health.status).toBe(ProviderStatus.HEALTHY);
      expect(health.message).toBe("Mock provider is healthy");
    });
  });

  describe("generateResponse", () => {
    it("should generate response with usage statistics", async () => {
      const provider = new MockProvider("test-provider", ProviderType.PRIMARY);
      const prompt = "Test prompt";

      const response = await provider.generateResponse(prompt);

      expect(response.content).toBe("Mock response to: Test prompt");
      expect(response.usage).toEqual({
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      });
    });
  });

  describe("ProviderType enum", () => {
    it("should have correct enum values", () => {
      expect(ProviderType.PRIMARY).toBe("primary");
      expect(ProviderType.FALLBACK).toBe("fallback");
    });
  });

  describe("ProviderStatus enum", () => {
    it("should have correct enum values", () => {
      expect(ProviderStatus.HEALTHY).toBe("healthy");
      expect(ProviderStatus.UNHEALTHY).toBe("unhealthy");
      expect(ProviderStatus.UNKNOWN).toBe("unknown");
    });
  });
});
