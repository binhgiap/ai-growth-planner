import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import axios, { AxiosInstance } from 'axios';

/**
 * AIProvider supports multiple AI backends
 * Supports: OpenAI, OpenRouter, Ollama
 * Configuration through AI_PROVIDER env variable
 */
@Injectable()
export class AIProvider {
  private provider: 'openai' | 'openrouter' | 'ollama';
  private openaiClient?: OpenAI;
  private openrouterClient?: AxiosInstance;
  private ollamaClient?: AxiosInstance;
  private logger = new Logger('AIProvider');

  constructor() {
    this.provider = (process.env.AI_PROVIDER || 'openai') as
      | 'openai'
      | 'openrouter'
      | 'ollama';

    if (this.provider === 'openai') {
      this.initializeOpenAI();
    } else if (this.provider === 'openrouter') {
      this.initializeOpenRouter();
    } else if (this.provider === 'ollama') {
      this.initializeOllama();
    } else {
      throw new BadRequestException(
        'Invalid AI_PROVIDER. Must be "openai", "openrouter", or "ollama"',
      );
    }

    this.logger.log(`Initialized AI Provider: ${this.provider.toUpperCase()}`);
  }

  private initializeOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new BadRequestException(
        'OPENAI_API_KEY is required when AI_PROVIDER=openai',
      );
    }

    this.openaiClient = new OpenAI({
      apiKey,
    });
  }

  private initializeOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new BadRequestException(
        'OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter',
      );
    }

    this.openrouterClient = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer':
          process.env.OPENROUTER_REFERER || 'http://localhost:3000',
        'X-Title': 'AI Growth Planner',
      },
    });
  }

  private initializeOllama() {
    const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    this.ollamaClient = axios.create({
      baseURL,
      timeout: 120000, // 2 minutes for long responses
    });

    this.logger.log(`Ollama configured at: ${baseURL}`);
  }

  /**
   * Get the model name based on provider
   */
  private getModel(): string {
    if (this.provider === 'openai') {
      return process.env.OPENAI_MODEL || 'gpt-4-turbo';
    } else if (this.provider === 'openrouter') {
      return process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
    } else {
      return process.env.OLLAMA_MODEL || 'llama2';
    }
  }

  /**
   * Generate completion using configured AI backend
   */
  async generateCompletion(
    systemPrompt: string,
    userMessage: string,
    temperature = 0.7,
  ): Promise<string> {
    if (this.provider === 'openai') {
      return this.generateCompletionOpenAI(
        systemPrompt,
        userMessage,
        temperature,
      );
    } else if (this.provider === 'openrouter') {
      return this.generateCompletionOpenRouter(
        systemPrompt,
        userMessage,
        temperature,
      );
    } else {
      return this.generateCompletionOllama(
        systemPrompt,
        userMessage,
        temperature,
      );
    }
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T>(
    systemPrompt: string,
    userMessage: string,
    temperature = 0.5,
  ): Promise<T> {
    if (this.provider === 'openai') {
      return this.generateJSONOpenAI<T>(systemPrompt, userMessage, temperature);
    } else if (this.provider === 'openrouter') {
      return this.generateJSONOpenRouter<T>(
        systemPrompt,
        userMessage,
        temperature,
      );
    } else {
      return this.generateJSONOllama<T>(systemPrompt, userMessage, temperature);
    }
  }

  /**
   * Generate streaming response
   */
  async *generateStream(
    systemPrompt: string,
    userMessage: string,
  ): AsyncGenerator<string> {
    if (this.provider === 'openai') {
      yield* this.generateStreamOpenAI(systemPrompt, userMessage);
    } else if (this.provider === 'openrouter') {
      yield* this.generateStreamOpenRouter(systemPrompt, userMessage);
    } else {
      yield* this.generateStreamOllama(systemPrompt, userMessage);
    }
  }

  // ==================== OpenAI Implementation ====================

  private async generateCompletionOpenAI(
    systemPrompt: string,
    userMessage: string,
    temperature: number,
  ): Promise<string> {
    const response = await this.openaiClient!.chat.completions.create({
      model: this.getModel(),
      temperature,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }

  private async generateJSONOpenAI<T>(
    systemPrompt: string,
    userMessage: string,
    temperature: number,
  ): Promise<T> {
    const response = await this.openaiClient!.chat.completions.create({
      model: this.getModel(),
      temperature,
      response_format: { type: 'json_object' },
      max_tokens: 16000, // Increase for large task lists
      messages: [
        {
          role: 'system',
          content:
            systemPrompt +
            '\n\nIMPORTANT: You MUST return valid JSON format. Your response will be parsed as JSON.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '{}';

    try {
      return JSON.parse(content) as T;
    } catch (error) {
      this.logger.error('Failed to parse JSON response:', content);
      throw new BadRequestException('AI returned invalid JSON response');
    }
  }

  private async *generateStreamOpenAI(
    systemPrompt: string,
    userMessage: string,
  ): AsyncGenerator<string> {
    const stream = await this.openaiClient!.chat.completions.create({
      model: this.getModel(),
      stream: true,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || '';
    }
  }

  // ==================== OpenRouter Implementation ====================

  private async generateCompletionOpenRouter(
    systemPrompt: string,
    userMessage: string,
    temperature: number,
  ): Promise<string> {
    try {
      const model = this.getModel();
      this.logger.debug(`OpenRouter: Calling ${model} with completion request`);

      const response = await this.openrouterClient!.post('/chat/completions', {
        model,
        temperature,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`OpenRouter API error: ${error.message}`);
        this.logger.error(`Stack: ${error.stack}`);
      }
      // Log the full error response if it's an axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error;
        this.logger.error(`Status: ${axiosError.response?.status}`);
        this.logger.error(`Data: ${JSON.stringify(axiosError.response?.data)}`);
      }
      throw error;
    }
  }
  private async generateJSONOpenRouter<T>(
    systemPrompt: string,
    userMessage: string,
    temperature: number,
  ): Promise<T> {
    try {
      const jsonPrompt = `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON, no additional text or markdown.`;
      const model = this.getModel();

      this.logger.debug(`OpenRouter: Calling ${model} with JSON request`);

      const response = await this.openrouterClient!.post('/chat/completions', {
        model,
        temperature,
        messages: [
          {
            role: 'system',
            content: jsonPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      const content = response.data.choices[0]?.message?.content || '{}';
      // Clean response to extract JSON if there's extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonContent) as T;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`OpenRouter JSON error: ${error.message}`);
        this.logger.error(`Stack: ${error.stack}`);
      }
      // Log the full error response if it's an axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error;
        this.logger.error(`Status: ${axiosError.response?.status}`);
        this.logger.error(`Data: ${JSON.stringify(axiosError.response?.data)}`);
        this.logger.error(
          `Headers: ${JSON.stringify(axiosError.response?.headers)}`,
        );
      }
      throw error;
    }
  }

  private async *generateStreamOpenRouter(
    systemPrompt: string,
    userMessage: string,
  ): AsyncGenerator<string> {
    try {
      const response = await this.openrouterClient!.post(
        '/chat/completions',
        {
          model: this.getModel(),
          stream: true,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
        },
        {
          responseType: 'stream',
        },
      );

      for await (const chunk of response.data) {
        const line = chunk.toString().trim();
        if (line.startsWith('data: ')) {
          const json = line.slice(6);
          if (json === '[DONE]') break;
          try {
            const data = JSON.parse(json);
            yield data.choices[0]?.delta?.content || '';
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `OpenRouter stream error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  // ==================== Ollama Implementation ====================

  private async generateCompletionOllama(
    systemPrompt: string,
    userMessage: string,
    temperature: number,
  ): Promise<string> {
    try {
      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

      const response = await this.ollamaClient!.post('/api/generate', {
        model: this.getModel(),
        prompt: fullPrompt,
        stream: false,
        temperature,
      });

      return response.data.response || '';
    } catch (error) {
      this.logger.error(
        `Ollama API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private async generateJSONOllama<T>(
    systemPrompt: string,
    userMessage: string,
    temperature: number,
  ): Promise<T> {
    try {
      const jsonPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nIMPORTANT: Return only valid JSON, no additional text.`;

      const response = await this.ollamaClient!.post('/api/generate', {
        model: this.getModel(),
        prompt: jsonPrompt,
        stream: false,
        temperature,
      });

      const content = response.data.response || '{}';
      // Clean response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;

      return JSON.parse(jsonContent) as T;
    } catch (error) {
      this.logger.error(
        `Ollama JSON generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private async *generateStreamOllama(
    systemPrompt: string,
    userMessage: string,
  ): AsyncGenerator<string> {
    try {
      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

      const response = await this.ollamaClient!.post(
        '/api/generate',
        {
          model: this.getModel(),
          prompt: fullPrompt,
          stream: true,
        },
        {
          responseType: 'stream',
        },
      );

      for await (const chunk of response.data) {
        const line = chunk.toString().trim();
        if (line) {
          try {
            const json = JSON.parse(line);
            yield json.response || '';
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Ollama stream error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Health check for the AI provider
   */
  async healthCheck(): Promise<{ provider: string; status: string }> {
    try {
      if (this.provider === 'openai') {
        // Simple OpenAI health check
        await this.openaiClient!.models.list();
        return { provider: 'openai', status: 'healthy' };
      } else if (this.provider === 'openrouter') {
        // Simple OpenRouter health check
        await this.openrouterClient!.get('/models');
        return { provider: 'openrouter', status: 'healthy' };
      } else {
        // Simple Ollama health check
        await this.ollamaClient!.get('/api/tags');
        return { provider: 'ollama', status: 'healthy' };
      }
    } catch (error) {
      this.logger.warn(
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return { provider: this.provider, status: 'unhealthy' };
    }
  }
}
