import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1783017961141 implements MigrationInterface {
    name = 'Init1783017961141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "is_verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_verified"`);
    }

}
