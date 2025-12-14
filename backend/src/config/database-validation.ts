/**
 * Database Configuration Validation
 * Validates database connectivity and configuration
 * @module config/database-validation
 */

import { DataSource } from 'typeorm';
import { typeOrmConfig } from './typeorm.config';

/**
 * Validate database configuration and connectivity
 * @returns {Promise<boolean>} True if database is accessible
 */
export async function validateDatabaseConfig(): Promise<boolean> {
  try {
    console.log('🔍 Testing database connection...');

    const dataSource = new DataSource(typeOrmConfig as any);
    await dataSource.initialize();

    const config = typeOrmConfig as any;
    console.log('✅ Database connection successful!');
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Port: ${config.port}`);

    await dataSource.destroy();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('   Error:', (error as Error).message);
    console.error('\n📝 Troubleshooting tips:');
    console.error('   1. Ensure PostgreSQL is running');
    console.error(
      '   2. Check DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_PASSWORD',
    );
    console.error(
      '   3. Verify the database exists: createdb ai_growth_planner',
    );
    console.error('   4. Check credentials in .env file');
    return false;
  }
}

/**
 * Get safe database configuration for display (without passwords)
 * @returns {Record<string, any>} Safe configuration details
 */
export function getSafeDatabaseConfig(): Record<string, any> {
  const config = typeOrmConfig as any;
  return {
    type: config.type,
    host: config.host,
    port: config.port,
    username: config.username,
    database: config.database,
    synchronize: config.synchronize,
    logging: config.logging,
  };
}

/**
 * Format database URL from configuration
 * @returns {string} Connection URL (without password)
 */
export function getDatabaseConnectionString(): string {
  const config = typeOrmConfig as any;
  return `${config.type}://${config.username}@${config.host}:${config.port}/${config.database}`;
}
