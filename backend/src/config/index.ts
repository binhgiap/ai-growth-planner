/**
 * Configuration Module Export
 * Central location for all configuration imports
 * @module config/index
 */

export { typeOrmConfig } from './typeorm.config';
export {
  getAIProviderConfig,
  validateAIProviderConfig,
  getSafeAIProviderConfig,
  type AIProviderConfig,
  type AIProviderType,
} from './ai-provider.config';
export {
  validateDatabaseConfig,
  getSafeDatabaseConfig,
  getDatabaseConnectionString,
} from './database-validation';
export {
  validateEnvironment,
  printEnvironmentValidationReport,
  getEnvVariablesByCategory,
} from './env-validation';
export {
  runStartupChecks,
  validateStartupConfig,
  type StartupCheckResult,
} from './startup';
