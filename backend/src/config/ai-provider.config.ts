/**
 * AI Provider Configuration Module
 * Provides unified configuration for all supported AI providers (OpenAI, OpenRouter, Ollama)
 * @module config/ai-provider
 */

export type AIProviderType = 'openai' | 'openrouter' | 'ollama';

export interface AIProviderConfig {
  provider: AIProviderType;
  apiKey?: string;
  model: string;
  baseURL?: string;
  referer?: string;
  timeout?: number;
}

/**
 * Get AI Provider Configuration from environment variables
 * @returns {AIProviderConfig} The configured AI provider settings
 * @throws {Error} If required environment variables are missing
 */
export function getAIProviderConfig(): AIProviderConfig {
  const provider = (process.env.AI_PROVIDER || 'openai') as AIProviderType;

  // Validate provider type
  const validProviders: AIProviderType[] = ['openai', 'openrouter', 'ollama'];
  if (!validProviders.includes(provider)) {
    throw new Error(
      `Invalid AI_PROVIDER: ${provider}. Must be one of: ${validProviders.join(', ')}`,
    );
  }

  switch (provider) {
    case 'openai':
      return getOpenAIConfig();
    case 'openrouter':
      return getOpenRouterConfig();
    case 'ollama':
      return getOllamaConfig();
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Get OpenAI Configuration
 * @returns {AIProviderConfig} OpenAI configuration
 * @throws {Error} If required OpenAI environment variables are missing
 */
function getOpenAIConfig(): AIProviderConfig {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4-turbo';

  if (!apiKey) {
    throw new Error(
      'Missing OPENAI_API_KEY environment variable. Please set it to use OpenAI provider.',
    );
  }

  return {
    provider: 'openai',
    apiKey,
    model,
  };
}

/**
 * Get OpenRouter Configuration
 * @returns {AIProviderConfig} OpenRouter configuration
 * @throws {Error} If required OpenRouter environment variables are missing
 */
function getOpenRouterConfig(): AIProviderConfig {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
  const referer = process.env.OPENROUTER_REFERER || 'http://localhost:3000';

  if (!apiKey) {
    throw new Error(
      'Missing OPENROUTER_API_KEY environment variable. Please set it to use OpenRouter provider.',
    );
  }

  return {
    provider: 'openrouter',
    apiKey,
    model,
    baseURL: 'https://openrouter.ai/api/v1',
    referer,
  };
}

/**
 * Get Ollama Configuration
 * @returns {AIProviderConfig} Ollama configuration
 */
function getOllamaConfig(): AIProviderConfig {
  const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama2';

  return {
    provider: 'ollama',
    model,
    baseURL,
    timeout: 120000, // 2 minutes for local processing
  };
}

/**
 * Validate AI Provider Configuration
 * Performs health checks and validation on the configured provider
 * @returns {Promise<boolean>} True if configuration is valid
 */
export async function validateAIProviderConfig(): Promise<boolean> {
  try {
    const config = getAIProviderConfig();

    // Additional validation based on provider type
    switch (config.provider) {
      case 'openai':
        if (!config.apiKey || !config.model) {
          return false;
        }
        // Validate OpenAI API key format (starts with 'sk-')
        if (!config.apiKey.startsWith('sk-')) {
          console.warn('⚠️  OpenAI API key format may be incorrect');
          return false;
        }
        break;

      case 'openrouter':
        if (!config.apiKey || !config.model) {
          return false;
        }
        // Validate OpenRouter API key format (starts with 'sk-or-v1-')
        if (!config.apiKey.startsWith('sk-or-v1-')) {
          console.warn('⚠️  OpenRouter API key format may be incorrect');
          return false;
        }
        break;

      case 'ollama':
        if (!config.model || !config.baseURL) {
          return false;
        }
        break;
    }

    console.log(`✅ AI Provider Configuration validated: ${config.provider}`);
    console.log(`   Model: ${config.model}`);
    if (config.baseURL) {
      console.log(`   Base URL: ${config.baseURL}`);
    }

    return true;
  } catch (error) {
    console.error('❌ AI Provider Configuration validation failed:', error);
    return false;
  }
}

/**
 * Get provider-specific configuration for display/debugging
 * @returns {Partial<AIProviderConfig>} Safe configuration without sensitive data
 */
export function getSafeAIProviderConfig(): Partial<AIProviderConfig> {
  const config = getAIProviderConfig();
  return {
    provider: config.provider,
    model: config.model,
    baseURL: config.baseURL,
  };
}
