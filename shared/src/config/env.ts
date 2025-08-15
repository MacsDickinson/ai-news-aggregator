import { z } from "zod";

/**
 * Shared environment variable validation schema
 */
const sharedEnvSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

/**
 * Validated shared environment configuration
 */
export type SharedEnvConfig = z.infer<typeof sharedEnvSchema>;

/**
 * Parse and validate shared environment variables
 */
function parseSharedEnv(): SharedEnvConfig {
  try {
    return sharedEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Shared environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Validated shared environment configuration instance
 */
export const sharedEnv = parseSharedEnv();

/**
 * Environment helper functions
 */
export const envHelpers = {
  isDevelopment: () => sharedEnv.NODE_ENV === "development",
  isProduction: () => sharedEnv.NODE_ENV === "production",
  isTest: () => sharedEnv.NODE_ENV === "test",
  getLogLevel: () => sharedEnv.LOG_LEVEL,
};
