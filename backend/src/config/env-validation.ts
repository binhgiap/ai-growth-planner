/**
 * Environment Configuration Validation
 * Validates all required environment variables are properly set
 * @module config/env-validation
 */

interface EnvVariable {
  key: string;
  required: boolean;
  description: string;
  example?: string;
  category: 'database' | 'server' | 'ai' | 'jwt' | 'application';
}

const ENV_VARIABLES: EnvVariable[] = [
  // Database
  {
    key: 'DATABASE_HOST',
    required: true,
    description: 'PostgreSQL host',
    example: 'localhost',
    category: 'database',
  },
  {
    key: 'DATABASE_PORT',
    required: true,
    description: 'PostgreSQL port',
    example: '5432',
    category: 'database',
  },
  {
    key: 'DATABASE_USERNAME',
    required: true,
    description: 'PostgreSQL username',
    example: 'postgres',
    category: 'database',
  },
  {
    key: 'DATABASE_PASSWORD',
    required: true,
    description: 'PostgreSQL password',
    example: 'password',
    category: 'database',
  },
  {
    key: 'DATABASE_NAME',
    required: true,
    description: 'PostgreSQL database name',
    example: 'ai_growth_planner',
    category: 'database',
  },

  // Server
  {
    key: 'PORT',
    required: false,
    description: 'Server port',
    example: '3000',
    category: 'server',
  },
  {
    key: 'NODE_ENV',
    required: false,
    description: 'Node environment',
    example: 'development',
    category: 'server',
  },

  // AI Provider
  {
    key: 'AI_PROVIDER',
    required: true,
    description: 'AI provider type (openai, openrouter, ollama)',
    example: 'openrouter',
    category: 'ai',
  },
  {
    key: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key (required if AI_PROVIDER=openai)',
    example: 'sk-proj-xxx',
    category: 'ai',
  },
  {
    key: 'OPENAI_MODEL',
    required: false,
    description: 'OpenAI model (required if AI_PROVIDER=openai)',
    example: 'gpt-4-turbo',
    category: 'ai',
  },
  {
    key: 'OPENROUTER_API_KEY',
    required: false,
    description: 'OpenRouter API key (required if AI_PROVIDER=openrouter)',
    example: 'sk-or-v1-xxx',
    category: 'ai',
  },
  {
    key: 'OPENROUTER_MODEL',
    required: false,
    description: 'OpenRouter model (required if AI_PROVIDER=openrouter)',
    example: 'openai/gpt-3.5-turbo',
    category: 'ai',
  },
  {
    key: 'OPENROUTER_REFERER',
    required: false,
    description: 'OpenRouter referer (required if AI_PROVIDER=openrouter)',
    example: 'http://localhost:3000',
    category: 'ai',
  },
  {
    key: 'OLLAMA_BASE_URL',
    required: false,
    description: 'Ollama base URL (required if AI_PROVIDER=ollama)',
    example: 'http://localhost:11434',
    category: 'ai',
  },
  {
    key: 'OLLAMA_MODEL',
    required: false,
    description: 'Ollama model (required if AI_PROVIDER=ollama)',
    example: 'llama2',
    category: 'ai',
  },

  // JWT
  {
    key: 'JWT_SECRET',
    required: false,
    description: 'JWT secret for authentication',
    example: 'your_jwt_secret_here',
    category: 'jwt',
  },
  {
    key: 'JWT_EXPIRATION',
    required: false,
    description: 'JWT expiration time',
    example: '7d',
    category: 'jwt',
  },

  // Application
  {
    key: 'LOG_LEVEL',
    required: false,
    description: 'Logging level',
    example: 'debug',
    category: 'application',
  },
];

/**
 * Get all environment variables organized by category
 * @returns {Record<string, EnvVariable[]>} Variables grouped by category
 */
export function getEnvVariablesByCategory(): Record<string, EnvVariable[]> {
  const grouped: Record<string, EnvVariable[]> = {};

  ENV_VARIABLES.forEach((envVar) => {
    if (!grouped[envVar.category]) {
      grouped[envVar.category] = [];
    }
    grouped[envVar.category].push(envVar);
  });

  return grouped;
}

/**
 * Validate all required environment variables
 * @returns {Object} Validation result with missing variables
 */
export function validateEnvironment(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];
  const provider = process.env.AI_PROVIDER || 'openai';

  ENV_VARIABLES.forEach((envVar) => {
    const isSet = process.env[envVar.key] !== undefined;

    // Check if variable is required based on AI provider
    let isRequired = envVar.required;

    if (envVar.category === 'ai') {
      if (provider === 'openai') {
        isRequired = envVar.key.startsWith('OPENAI');
      } else if (provider === 'openrouter') {
        isRequired = envVar.key.startsWith('OPENROUTER');
      } else if (provider === 'ollama') {
        isRequired = envVar.key.startsWith('OLLAMA');
      }
    }

    if (isRequired && !isSet) {
      missing.push(envVar.key);
    }

    // Additional validation rules
    if (
      isSet &&
      envVar.key === 'OPENAI_API_KEY' &&
      !process.env.OPENAI_API_KEY?.startsWith('sk-')
    ) {
      warnings.push(
        `${envVar.key} format looks incorrect (should start with 'sk-')`,
      );
    }

    if (
      isSet &&
      envVar.key === 'OPENROUTER_API_KEY' &&
      !process.env.OPENROUTER_API_KEY?.startsWith('sk-or-v1-')
    ) {
      warnings.push(
        `${envVar.key} format looks incorrect (should start with 'sk-or-v1-')`,
      );
    }

    if (isSet && envVar.key === 'PORT') {
      const port = parseInt(process.env.PORT || '', 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        warnings.push(`${envVar.key} must be a valid port number (1-65535)`);
      }
    }

    if (isSet && envVar.key === 'DATABASE_PORT') {
      const port = parseInt(process.env.DATABASE_PORT || '', 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        warnings.push(`${envVar.key} must be a valid port number (1-65535)`);
      }
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Print environment validation report
 */
export function printEnvironmentValidationReport(): void {
  const validation = validateEnvironment();
  const grouped = getEnvVariablesByCategory();

  console.log('\n📋 Environment Configuration Report');
  console.log('═'.repeat(60));

  // Print by category
  Object.entries(grouped).forEach(([category, vars]) => {
    console.log(`\n${category.toUpperCase()}`);
    console.log('─'.repeat(60));

    vars.forEach((envVar) => {
      const isSet = process.env[envVar.key] !== undefined;
      const status = isSet ? '✅' : '❌';
      const required = envVar.required ? '[REQUIRED]' : '[OPTIONAL]';

      console.log(`${status} ${envVar.key.padEnd(25)} ${required}`);
      console.log(`   ${envVar.description}`);

      if (!isSet && envVar.example) {
        console.log(`   Example: ${envVar.example}`);
      }
    });
  });

  // Print validation summary
  console.log('\n' + '═'.repeat(60));
  if (validation.isValid) {
    console.log('✅ All required environment variables are set!');
  } else {
    console.log('❌ Missing required environment variables:');
    validation.missing.forEach((key) => {
      console.log(`   • ${key}`);
    });
  }

  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach((warning) => {
      console.log(`   • ${warning}`);
    });
  }

  console.log('═'.repeat(60) + '\n');
}
