import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1783080931356 implements MigrationInterface {
    name = 'Init1783080931356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "deleted_at" TO "verified_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "verified_at" TO "deleted_at"`);
    }

}
