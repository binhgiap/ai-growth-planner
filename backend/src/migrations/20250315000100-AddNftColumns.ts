import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNftColumns20250315000100 implements MigrationInterface {
  name = 'AddNftColumns20250315000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension exists (for uuid_generate_v4)
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    );

    // Add isMintedNft flag to goals
    await queryRunner.query(
      `ALTER TABLE "goals" ADD COLUMN "isMintedNft" boolean NOT NULL DEFAULT false`,
    );

    // Add numberOfNft counter to users
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "numberOfNft" integer NOT NULL DEFAULT 0`,
    );

    // Create nfts table to store mint transaction hashes per user
    await queryRunner.query(`
      CREATE TABLE "nfts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "txHash" character varying(255) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_nfts_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "nfts"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "numberOfNft"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" DROP COLUMN IF EXISTS "isMintedNft"`,
    );
  }
}


