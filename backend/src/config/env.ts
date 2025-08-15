import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("3001"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // LocalStack Configuration
  USE_LOCALSTACK: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  LOCALSTACK_ENDPOINT: z.string().url().default("http://localhost:4566"),

  // AWS Configuration
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  DYNAMODB_TABLE_PREFIX: z.string().default("ai-news-aggregator"),
  OPENSEARCH_ENDPOINT: z.string().url().optional(),

  // API Keys
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  ANTHROPIC_API_KEY: z.string().optional(),
  NEWS_API_KEY: z.string().optional(),

  // Authentication
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // OAuth Credentials
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  SUBSTACK_CLIENT_ID: z.string().optional(),
  SUBSTACK_CLIENT_SECRET: z.string().optional(),

  // Feature Flags
  ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  ENABLE_CACHING: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

/**
 * Validated environment configuration
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
function parseEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Validated environment configuration instance
 */
export const env = parseEnv();

/**
 * AWS configuration based on environment
 */
export const awsConfig = {
  region: env.AWS_REGION,
  endpoint: env.USE_LOCALSTACK ? env.LOCALSTACK_ENDPOINT : undefined,
  credentials: env.USE_LOCALSTACK
    ? {
        accessKeyId: "test",
        secretAccessKey: "test",
      }
    : {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
};

/**
 * Database configuration
 */
export const dbConfig = {
  tablePrefix: env.DYNAMODB_TABLE_PREFIX,
  opensearchEndpoint: env.OPENSEARCH_ENDPOINT,
};

/**
 * Provider configuration
 */
export const providerConfig = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
  },
  news: {
    apiKey: env.NEWS_API_KEY,
  },
};

/**
 * Auth configuration
 */
export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  oauth: {
    linkedin: {
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    },
    substack: {
      clientId: env.SUBSTACK_CLIENT_ID,
      clientSecret: env.SUBSTACK_CLIENT_SECRET,
    },
  },
};

/**
 * Feature flags
 */
export const featureFlags = {
  analytics: env.ENABLE_ANALYTICS,
  caching: env.ENABLE_CACHING,
};
