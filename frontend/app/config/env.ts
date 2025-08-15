import { z } from "zod";

/**
 * Frontend environment variable validation schema
 * Note: Only VITE_ prefixed variables are available in the browser
 */
const envSchema = z.object({
  // API Configuration
  VITE_API_BASE_URL: z.string().url().default("http://localhost:3001"),
  VITE_APP_NAME: z.string().default("AI News Aggregator"),

  // Feature Flags
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  VITE_ENABLE_DEBUG: z
    .string()
    .transform((val) => val === "true")
    .default("false"),

  // OAuth Configuration (client-side safe values only)
  VITE_LINKEDIN_CLIENT_ID: z.string().optional(),
  VITE_SUBSTACK_CLIENT_ID: z.string().optional(),
});

/**
 * Validated environment configuration for frontend
 */
export type FrontendEnvConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate frontend environment variables
 */
function parseEnv(): FrontendEnvConfig {
  // In Remix, environment variables are available through process.env on server
  // and need to be passed to the client through loader data
  const envVars =
    typeof window !== "undefined" ? (window as any).ENV : process.env;

  try {
    return envSchema.parse(envVars);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Frontend environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      // In browser, don't exit process, just throw
      if (typeof window !== "undefined") {
        throw new Error("Environment validation failed");
      }
      // Don't exit process in server-side rendering
      throw new Error("Environment validation failed");
    }
    throw error;
  }
}

/**
 * Validated frontend environment configuration
 */
export const frontendEnv = parseEnv();

/**
 * API configuration
 */
export const apiConfig = {
  baseUrl: frontendEnv.VITE_API_BASE_URL,
  appName: frontendEnv.VITE_APP_NAME,
};

/**
 * Frontend feature flags
 */
export const frontendFeatureFlags = {
  analytics: frontendEnv.VITE_ENABLE_ANALYTICS,
  debug: frontendEnv.VITE_ENABLE_DEBUG,
};

/**
 * OAuth configuration for frontend
 */
export const frontendOAuthConfig = {
  linkedin: {
    clientId: frontendEnv.VITE_LINKEDIN_CLIENT_ID,
  },
  substack: {
    clientId: frontendEnv.VITE_SUBSTACK_CLIENT_ID,
  },
};
