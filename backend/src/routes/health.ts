import { Router } from "express";
import { providerManager } from "@services/providers/manager";
import { env } from "@config/env";

const router = Router();

/**
 * Basic health check endpoint
 */
router.get("/", async (req, res) => {
  try {
    const health = await providerManager.getAggregatedHealth();

    const status = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      providers: health,
    };

    // Return 503 if no providers are healthy
    const statusCode = health.healthy ? 200 : 503;
    res.status(statusCode).json(status);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Detailed health check with provider information
 */
router.get("/detailed", async (req, res) => {
  try {
    const [aggregatedHealth, allStatuses] = await Promise.all([
      providerManager.getAggregatedHealth(),
      providerManager.getAllStatuses(),
    ]);

    const systemInfo = {
      node: {
        version: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        arch: process.arch,
      },
      environment: {
        nodeEnv: env.NODE_ENV,
        region: process.env.AWS_REGION || "unknown",
        useLocalstack: env.USE_LOCALSTACK,
      },
    };

    const response = {
      status: aggregatedHealth.healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      system: systemInfo,
      providers: {
        summary: {
          total: aggregatedHealth.totalProviders,
          healthy: aggregatedHealth.healthyProviders,
          unhealthy:
            aggregatedHealth.totalProviders - aggregatedHealth.healthyProviders,
        },
        details: allStatuses,
      },
    };

    const statusCode = aggregatedHealth.healthy ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Provider-specific health check
 */
router.get("/providers/:providerName", async (req, res) => {
  try {
    const { providerName } = req.params;
    const provider = providerManager.getProvider(providerName);

    if (!provider) {
      return res.status(404).json({
        status: "error",
        message: `Provider '${providerName}' not found`,
        availableProviders: providerManager.getProviderNames(),
      });
    }

    const status = await provider.getStatus();
    const statusCode = status.healthy ? 200 : 503;

    res.status(statusCode).json({
      status: status.healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      provider: status,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Force health check on all providers
 */
router.post("/check", async (req, res) => {
  try {
    await providerManager.performHealthChecks();
    const health = await providerManager.getAggregatedHealth();

    res.json({
      status: "complete",
      timestamp: new Date().toISOString(),
      message: "Health checks performed on all providers",
      results: health,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Test provider with a simple completion
 */
router.post("/test/:providerName", async (req, res) => {
  try {
    const { providerName } = req.params;
    const { message = "Hello, this is a test. Please respond with OK." } =
      req.body;

    const provider = providerManager.getProvider(providerName);
    if (!provider) {
      return res.status(404).json({
        status: "error",
        message: `Provider '${providerName}' not found`,
      });
    }

    const startTime = Date.now();
    let result: any;

    // Type-specific testing
    if (provider.name === "OpenAI") {
      const openaiProvider = provider as any;
      result = await openaiProvider.generateCompletion(
        [{ role: "user", content: message }],
        {
          maxTokens: 50,
          temperature: 0,
        },
      );
    } else if (provider.name === "Anthropic") {
      const anthropicProvider = provider as any;
      result = await anthropicProvider.generateCompletion(
        [{ role: "user", content: message }],
        {
          maxTokens: 50,
          temperature: 0,
        },
      );
    } else {
      return res.status(400).json({
        status: "error",
        message: `Testing not implemented for provider: ${provider.name}`,
      });
    }

    const responseTime = Date.now() - startTime;

    res.json({
      status: "success",
      timestamp: new Date().toISOString(),
      provider: provider.name,
      test: {
        input: message,
        output: result.content,
        responseTime,
        usage: result.usage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
