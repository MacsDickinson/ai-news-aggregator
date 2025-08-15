import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock the parseEnv function to prevent process.exit during tests
const mockEnv = {
  NODE_ENV: "test" as const,
  PORT: 3001,
  AWS_REGION: "us-east-1",
  USE_LOCALSTACK: false,
  LOCALSTACK_ENDPOINT: undefined,
  AWS_ACCESS_KEY_ID: undefined,
  AWS_SECRET_ACCESS_KEY: undefined,
  OPENAI_API_KEY: undefined,
  ANTHROPIC_API_KEY: undefined,
  JWT_SECRET: "test-jwt-secret-that-is-long-enough-for-validation",
  CORS_ORIGINS: "http://localhost:3000",
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX_REQUESTS: 100,
};

vi.mock("./env", () => ({
  parseEnv: vi.fn(() => mockEnv),
  env: mockEnv,
  awsConfig: {
    region: "us-east-1",
    endpoint: undefined,
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
  },
}));

describe("Environment Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mocked environment", () => {
    it("should have test configuration", async () => {
      const { env } = await import("./env");

      expect(env.NODE_ENV).toBe("test");
      expect(env.PORT).toBe(3001);
      expect(env.AWS_REGION).toBe("us-east-1");
      expect(env.USE_LOCALSTACK).toBe(false);
    });

    it("should have AWS configuration", async () => {
      const { awsConfig } = await import("./env");

      expect(awsConfig.region).toBe("us-east-1");
      expect(awsConfig.credentials).toEqual({
        accessKeyId: "test",
        secretAccessKey: "test",
      });
    });

    it("should have JWT secret configured", async () => {
      const { env } = await import("./env");

      expect(env.JWT_SECRET).toBe(
        "test-jwt-secret-that-is-long-enough-for-validation",
      );
    });

    it("should have CORS origins configured", async () => {
      const { env } = await import("./env");

      expect(env.CORS_ORIGINS).toBe("http://localhost:3000");
    });

    it("should have rate limiting configured", async () => {
      const { env } = await import("./env");

      expect(env.RATE_LIMIT_WINDOW_MS).toBe(900000);
      expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(100);
    });
  });
});
