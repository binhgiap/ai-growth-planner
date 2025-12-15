/**
 * Database Migration Script for Authentication
 *
 * This script adds authentication-related columns to the users table.
 * Run this BEFORE starting the backend server with the new code.
 *
 * Command: npm run migration:run
 */

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAuthenticationToUsers1702598400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add password column if it doesn't exist
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        length: '255',
        isNullable: true,
        default: null,
      }),
    );

    // Add role column with enum type
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'enum',
        enum: ['admin', 'user', 'manager'],
        default: "'user'",
      }),
    );

    // Add isActive column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: remove columns
    await queryRunner.dropColumn('users', 'password');
    await queryRunner.dropColumn('users', 'role');
    await queryRunner.dropColumn('users', 'isActive');
  }
}
