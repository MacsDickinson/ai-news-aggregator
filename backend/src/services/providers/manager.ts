import { AIProvider, ProviderStatus } from "./base";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { providerConfig } from "@config/env";

/**
 * Provider manager handles multiple AI providers with fallback logic
 */
export class ProviderManager {
  private providers: Map<string, AIProvider> = new Map();
  private fallbackOrder: string[] = [];

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize available providers based on configuration
   */
  private initializeProviders(): void {
    // Initialize OpenAI if API key is available
    if (providerConfig.openai.apiKey) {
      try {
        const openai = new OpenAIProvider();
        this.providers.set("openai", openai);
        this.fallbackOrder.push("openai");
      } catch (error) {
        console.warn("Failed to initialize OpenAI provider:", error);
      }
    }

    // Initialize Anthropic if API key is available
    if (providerConfig.anthropic.apiKey) {
      try {
        const anthropic = new AnthropicProvider();
        this.providers.set("anthropic", anthropic);
        this.fallbackOrder.push("anthropic");
      } catch (error) {
        console.warn("Failed to initialize Anthropic provider:", error);
      }
    }

    if (this.providers.size === 0) {
      throw new Error(
        "No AI providers could be initialized. Check your API keys.",
      );
    }

    console.log(
      `Initialized ${this.providers.size} AI provider(s): ${Array.from(this.providers.keys()).join(", ")}`,
    );
  }

  /**
   * Get a healthy provider, trying the fallback order
   */
  async getHealthyProvider(preferredProvider?: string): Promise<AIProvider> {
    // Try preferred provider first if specified and available
    if (preferredProvider && this.providers.has(preferredProvider)) {
      const provider = this.providers.get(preferredProvider)!;
      if (await provider.isHealthy()) {
        return provider;
      }
    }

    // Try providers in fallback order
    for (const providerName of this.fallbackOrder) {
      const provider = this.providers.get(providerName);
      if (provider && (await provider.isHealthy())) {
        return provider;
      }
    }

    throw new Error("No healthy AI providers available");
  }

  /**
   * Get all provider statuses
   */
  async getAllStatuses(): Promise<Record<string, ProviderStatus>> {
    const statuses: Record<string, ProviderStatus> = {};

    await Promise.all(
      Array.from(this.providers.entries()).map(async ([name, provider]) => {
        try {
          statuses[name] = await provider.getStatus();
        } catch (error) {
          statuses[name] = {
            name: provider.name,
            healthy: false,
            lastCheck: new Date(),
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    return statuses;
  }

  /**
   * Check if any provider is healthy
   */
  async hasHealthyProvider(): Promise<boolean> {
    try {
      await this.getHealthyProvider();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get provider by name
   */
  getProvider(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get list of available provider names
   */
  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Generate completion with automatic fallback
   */
  async generateCompletion(
    messages: any[],
    options: {
      preferredProvider?: string;
      model?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {},
  ): Promise<{
    content: string;
    provider: string;
    usage: any;
    metadata: Record<string, any>;
  }> {
    const provider = await this.getHealthyProvider(options.preferredProvider);

    let result: any;

    if (provider instanceof OpenAIProvider) {
      result = await provider.generateCompletion(messages, options);
      return {
        content: result.content,
        provider: provider.name,
        usage: result.usage,
        metadata: {
          finishReason: result.finishReason,
          model: options.model || "gpt-4o-mini",
        },
      };
    } else if (provider instanceof AnthropicProvider) {
      result = await provider.generateCompletion(messages, options);
      return {
        content: result.content,
        provider: provider.name,
        usage: result.usage,
        metadata: {
          stopReason: result.stopReason,
          model: options.model || "claude-3-haiku-20240307",
        },
      };
    }

    throw new Error(`Unsupported provider: ${provider.name}`);
  }

  /**
   * Perform health checks on all providers
   */
  async performHealthChecks(): Promise<void> {
    await Promise.all(
      Array.from(this.providers.values()).map(async (provider) => {
        try {
          await provider.isHealthy();
        } catch (error) {
          console.warn(`Health check failed for ${provider.name}:`, error);
        }
      }),
    );
  }

  /**
   * Get aggregated health status
   */
  async getAggregatedHealth(): Promise<{
    healthy: boolean;
    totalProviders: number;
    healthyProviders: number;
    statuses: Record<string, ProviderStatus>;
  }> {
    const statuses = await this.getAllStatuses();
    const healthyCount = Object.values(statuses).filter(
      (status) => status.healthy,
    ).length;

    return {
      healthy: healthyCount > 0,
      totalProviders: this.providers.size,
      healthyProviders: healthyCount,
      statuses,
    };
  }
}

// Singleton instance
export const providerManager = new ProviderManager();
