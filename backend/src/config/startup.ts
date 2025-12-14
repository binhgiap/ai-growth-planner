/**
 * Application Startup Configuration
 * Validates configuration and performs health checks before starting the app
 * @module config/startup
 */

import { validateAIProviderConfig } from './ai-provider.config';
import { validateDatabaseConfig } from './database-validation';
import {
  validateEnvironment,
  printEnvironmentValidationReport,
} from './env-validation';

export interface StartupCheckResult {
  name: string;
  status: 'success' | 'failure' | 'warning';
  message: string;
  details?: string;
}

/**
 * Run all startup checks
 * @returns {Promise<StartupCheckResult[]>} Array of check results
 */
export async function runStartupChecks(): Promise<StartupCheckResult[]> {
  const results: StartupCheckResult[] = [];

  console.log('\n🚀 AI Growth Planner Backend - Startup Checks');
  console.log('═'.repeat(60));

  // Check 1: Environment Variables
  console.log('\n1️⃣  Validating environment variables...');
  const envValidation = validateEnvironment();
  if (envValidation.isValid) {
    results.push({
      name: 'Environment Variables',
      status: 'success',
      message: 'All required environment variables are set',
    });
    console.log('✅ Environment variables validated');
  } else {
    results.push({
      name: 'Environment Variables',
      status: 'failure',
      message: 'Missing required environment variables',
      details: envValidation.missing.join(', '),
    });
    console.log('❌ Missing environment variables:');
    envValidation.missing.forEach((key) => {
      console.log(`   • ${key}`);
    });
  }

  if (envValidation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    envValidation.warnings.forEach((warning) => {
      console.log(`   • ${warning}`);
    });
  }

  // Check 2: AI Provider Configuration
  console.log('\n2️⃣  Validating AI provider configuration...');
  try {
    const aiConfigValid = await validateAIProviderConfig();
    if (aiConfigValid) {
      results.push({
        name: 'AI Provider Configuration',
        status: 'success',
        message: `AI provider configured and validated`,
      });
    } else {
      results.push({
        name: 'AI Provider Configuration',
        status: 'failure',
        message: 'AI provider configuration validation failed',
      });
    }
  } catch (error) {
    results.push({
      name: 'AI Provider Configuration',
      status: 'failure',
      message: `AI provider configuration error: ${(error as Error).message}`,
    });
    console.log(`❌ Error: ${(error as Error).message}`);
  }

  // Check 3: Database Configuration (Optional - can fail gracefully)
  console.log('\n3️⃣  Checking database connectivity...');
  try {
    const dbValid = await validateDatabaseConfig();
    if (dbValid) {
      results.push({
        name: 'Database Connection',
        status: 'success',
        message: 'Database connection successful',
      });
    } else {
      results.push({
        name: 'Database Connection',
        status: 'warning',
        message: 'Database connection failed, but continuing with startup',
      });
    }
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'warning',
      message: `Database check error: ${(error as Error).message}`,
    });
    console.log(`⚠️  Warning: Database connection check failed`);
  }

  // Print summary
  printStartupSummary(results);

  return results;
}

/**
 * Print startup check summary
 * @param {StartupCheckResult[]} results - Array of check results
 */
function printStartupSummary(results: StartupCheckResult[]): void {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Startup Check Summary');
  console.log('═'.repeat(60));

  let successCount = 0;
  let failureCount = 0;
  let warningCount = 0;

  results.forEach((result) => {
    const icon =
      result.status === 'success'
        ? '✅'
        : result.status === 'failure'
          ? '❌'
          : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);

    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }

    if (result.status === 'success') successCount++;
    else if (result.status === 'failure') failureCount++;
    else warningCount++;
  });

  console.log('═'.repeat(60));
  console.log(
    `✅ Passed: ${successCount} | ❌ Failed: ${failureCount} | ⚠️  Warnings: ${warningCount}`,
  );
  console.log('═'.repeat(60) + '\n');

  // Return exit code if critical checks fail
  if (failureCount > 0) {
    console.error(
      '🛑 Startup failed due to critical errors. Please fix the issues above.',
    );
    process.exit(1);
  }
}

/**
 * Validate startup configuration with optional database check
 * @param {boolean} checkDatabase - Whether to validate database connection
 * @returns {Promise<boolean>} True if critical checks pass
 */
export async function validateStartupConfig(
  checkDatabase = true,
): Promise<boolean> {
  const results = await runStartupChecks();

  const failures = results.filter(
    (r) =>
      r.status === 'failure' &&
      (checkDatabase || r.name !== 'Database Connection'),
  );

  return failures.length === 0;
}
