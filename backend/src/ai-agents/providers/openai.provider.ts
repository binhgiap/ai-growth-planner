import { Injectable } from '@nestjs/common';
import { AIProvider } from './ai.provider';

/**
 * OpenAIProvider - Backward compatibility wrapper
 * Delegates to AIProvider which supports both OpenAI and Ollama
 * For new code, use AIProvider directly
 */
@Injectable()
export class OpenAIProvider {
  constructor(private aiProvider: AIProvider) {}

  /**
   * Generate completion using configured AI backend
   */
  async generateCompletion(
    systemPrompt: string,
    userMessage: string,
    temperature = 0.7,
  ): Promise<string> {
    return this.aiProvider.generateCompletion(
      systemPrompt,
      userMessage,
      temperature,
    );
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T>(
    systemPrompt: string,
    userMessage: string,
    temperature = 0.5,
  ): Promise<T> {
    return this.aiProvider.generateJSON<T>(
      systemPrompt,
      userMessage,
      temperature,
    );
  }

  /**
   * Generate streaming response
   */
  async *generateStream(
    systemPrompt: string,
    userMessage: string,
  ): AsyncGenerator<string> {
    yield* this.aiProvider.generateStream(systemPrompt, userMessage);
  }
}
