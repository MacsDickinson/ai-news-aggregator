import OpenAI from "openai";
import {
  BaseAIProvider,
  HealthCheckResult,
  ProviderError,
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderServiceError,
} from "./base";
import { providerConfig } from "@config/env";

/**
 * OpenAI API integration with health monitoring
 */
export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;
  private readonly model: string = "gpt-4o-mini";

  constructor() {
    super("OpenAI");

    if (!providerConfig.openai.apiKey) {
      throw new ProviderError("OpenAI API key is required", this.name);
    }

    this.client = new OpenAI({
      apiKey: providerConfig.openai.apiKey,
    });
  }

  /**
   * Perform health check by making a simple API call
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    try {
      const { result, latency } = await this.measureLatency(async () => {
        return await this.client.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: "user",
              content: 'Health check. Respond with just "OK".',
            },
          ],
          max_tokens: 5,
          temperature: 0,
        });
      });

      return {
        success: true,
        latency,
        metadata: {
          model: this.model,
          tokensUsed: result.usage?.total_tokens || 0,
          finishReason: result.choices[0]?.finish_reason,
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
   * Generate a completion using OpenAI
   */
  async generateCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {},
  ): Promise<{
    content: string;
    usage: OpenAI.Completions.CompletionUsage | undefined;
    finishReason: string | null;
  }> {
    try {
      const systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
        options.systemPrompt
          ? [{ role: "system", content: options.systemPrompt }]
          : [];

      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: options.model || this.model,
          messages: [...systemMessage, ...messages],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature ?? 0.7,
        });
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new ProviderServiceError(
          this.name,
          new Error("No content in response"),
        );
      }

      return {
        content: choice.message.content,
        usage: response.usage,
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      throw this.convertError(error);
    }
  }

  /**
   * Generate embeddings using OpenAI
   */
  async generateEmbeddings(
    texts: string[],
    model: string = "text-embedding-3-small",
  ): Promise<{
    embeddings: number[][];
    usage: OpenAI.Embeddings.CreateEmbeddingResponse.Usage;
  }> {
    try {
      const response = await this.retry(async () => {
        return await this.client.embeddings.create({
          model,
          input: texts,
        });
      });

      return {
        embeddings: response.data.map((item) => item.embedding),
        usage: response.usage,
      };
    } catch (error) {
      throw this.convertError(error);
    }
  }

  /**
   * Parse error messages from OpenAI API
   */
  private parseError(error: unknown): string {
    if (error instanceof Error) {
      // Check if it's an OpenAI API error
      if ("status" in error) {
        const status = (error as any).status;
        const message = (error as any).message || error.message;
        return `OpenAI API error (${status}): ${message}`;
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
   * Get available models
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await this.client.models.list();
      return response.data
        .filter((model) => model.id.includes("gpt"))
        .map((model) => model.id)
        .sort();
    } catch (error) {
      throw this.convertError(error);
    }
  }

  /**
   * Get usage statistics (if available)
   */
  async getUsage(): Promise<Record<string, any> | null> {
    // OpenAI doesn't provide a usage endpoint in the current API
    // This would need to be tracked separately
    return null;
  }
}
