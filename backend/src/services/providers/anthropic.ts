import Anthropic from "@anthropic-ai/sdk";
import {
  BaseAIProvider,
  HealthCheckResult,
  ProviderError,
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderServiceError,
} from "./base";
import { providerConfig } from "@config/env";

// Type definitions for Anthropic messages
type MessageParam = {
  role: "user" | "assistant";
  content: string;
};

type Usage = {
  input_tokens: number;
  output_tokens: number;
};

type TextBlock = {
  type: "text";
  text: string;
};

/**
 * Anthropic API integration with health monitoring
 */
export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;
  private readonly model: string = "claude-3-haiku-20240307";

  constructor() {
    super("Anthropic");

    if (!providerConfig.anthropic.apiKey) {
      throw new ProviderError("Anthropic API key is required", this.name);
    }

    this.client = new Anthropic({
      apiKey: providerConfig.anthropic.apiKey,
    });
  }

  /**
   * Perform health check by making a simple API call
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    try {
      const { result, latency } = await this.measureLatency(async () => {
        return await (this.client as any).messages.create({
          model: this.model,
          max_tokens: 10,
          messages: [
            {
              role: "user",
              content: 'Health check. Respond with just "OK".',
            },
          ],
        });
      });

      return {
        success: true,
        latency,
        metadata: {
          model: this.model,
          tokensUsed: result.usage.output_tokens + result.usage.input_tokens,
          stopReason: result.stop_reason,
        },
      };
    } catch (error) {
      return {
        success: false,
        latency: 0,
        error: this.parseError(error),
        metadata: {
          model: this.model,
        },
      };
    }
  }

  /**
   * Generate a completion using Anthropic
   */
  async generateCompletion(
    messages: MessageParam[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {},
  ): Promise<{
    content: string;
    usage: Usage;
    stopReason: string | null;
  }> {
    try {
      const response = await this.retry(async () => {
        return await (this.client as any).messages.create({
          model: options.model || this.model,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature ?? 0.7,
          system: options.systemPrompt,
          messages,
        });
      });

      // Extract text content from the response
      const textContent = response.content
        .filter((block: any) => block.type === "text")
        .map((block: any) => block.text)
        .join("\n");

      if (!textContent) {
        throw new ProviderServiceError(
          this.name,
          new Error("No text content in response"),
        );
      }

      return {
        content: textContent,
        usage: response.usage,
        stopReason: response.stop_reason,
      };
    } catch (error) {
      throw this.convertError(error);
    }
  }

  /**
   * Parse error messages from Anthropic API
   */
  private parseError(error: unknown): string {
    if (error instanceof Error) {
      // Check if it's an Anthropic API error
      if ("status" in error) {
        const status = (error as any).status;
        const message = (error as any).message || error.message;
        return `Anthropic API error (${status}): ${message}`;
      }
      return error.message;
    }
    return String(error);
  }

  /**
   * Convert errors to appropriate provider error types
   */
  private convertError(error: unknown): ProviderError {
    if (error instanceof Error && "status" in error) {
      const status = (error as any).status;
      const message = (error as any).message || error.message;

      switch (status) {
        case 401:
          return new ProviderAuthError(this.name);
        case 429:
          return new ProviderRateLimitError(this.name);
        case 500:
        case 502:
        case 503:
        case 504:
          return new ProviderServiceError(this.name, error);
        default:
          return new ProviderError(message, this.name, status, error);
      }
    }

    return new ProviderServiceError(
      this.name,
      error instanceof Error ? error : new Error(String(error)),
    );
  }

  /**
   * Get available models (Anthropic doesn't provide a models endpoint)
   */
  async getModels(): Promise<string[]> {
    // Anthropic doesn't provide a models API endpoint
    // Return the known models
    return [
      "claude-3-haiku-20240307",
      "claude-3-sonnet-20240229",
      "claude-3-opus-20240229",
      "claude-3-5-sonnet-20241022",
    ];
  }

  /**
   * Get usage statistics (if available)
   */
  async getUsage(): Promise<Record<string, any> | null> {
    // Anthropic doesn't provide a usage endpoint in the current API
    // This would need to be tracked separately
    return null;
  }
}
