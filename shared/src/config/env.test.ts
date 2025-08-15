import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { sharedEnv, envHelpers } from "./env";

describe("Shared Environment Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env to a clean state
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("sharedEnv", () => {
    it("should have environment configuration", () => {
      expect(sharedEnv).toHaveProperty("NODE_ENV");
      expect(sharedEnv).toHaveProperty("LOG_LEVEL");
      expect(typeof sharedEnv.NODE_ENV).toBe("string");
      expect(typeof sharedEnv.LOG_LEVEL).toBe("string");
    });

    it("should have valid NODE_ENV values", () => {
      const validNodeEnvs = ["development", "test", "production"];
      expect(validNodeEnvs).toContain(sharedEnv.NODE_ENV);
    });

    it("should have valid LOG_LEVEL values", () => {
      const validLogLevels = ["debug", "info", "warn", "error"];
      expect(validLogLevels).toContain(sharedEnv.LOG_LEVEL);
    });
  });

  describe("envHelpers", () => {
    it("should provide environment check functions", () => {
      expect(typeof envHelpers.isDevelopment).toBe("function");
      expect(typeof envHelpers.isProduction).toBe("function");
      expect(typeof envHelpers.isTest).toBe("function");
      expect(typeof envHelpers.getLogLevel).toBe("function");
    });

    it("should return boolean values for environment checks", () => {
      expect(typeof envHelpers.isDevelopment()).toBe("boolean");
      expect(typeof envHelpers.isProduction()).toBe("boolean");
      expect(typeof envHelpers.isTest()).toBe("boolean");
    });

    it("should return log level string", () => {
      const logLevel = envHelpers.getLogLevel();
      expect(typeof logLevel).toBe("string");
      expect(["debug", "info", "warn", "error"]).toContain(logLevel);
    });

    it("should have consistent environment state", () => {
      const isDev = envHelpers.isDevelopment();
      const isProd = envHelpers.isProduction();
      const isTest = envHelpers.isTest();

      // Only one should be true
      const trueCount = [isDev, isProd, isTest].filter(Boolean).length;
      expect(trueCount).toBe(1);
    });
  });
});
