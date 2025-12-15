import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropNumberOfNftColumn20250315000200
  implements MigrationInterface
{
  name = 'DropNumberOfNftColumn20250315000200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "numberOfNft"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "numberOfNft" integer NOT NULL DEFAULT 0`,
    );
  }
}


