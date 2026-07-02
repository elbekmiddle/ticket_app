import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1782998702322 implements MigrationInterface {
    name = 'Init1782998702322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    }

}
