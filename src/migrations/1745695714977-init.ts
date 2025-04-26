import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1745695714977 implements MigrationInterface {
    name = 'Init1745695714977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "peso"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "peso" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "peso"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "peso" integer`);
    }

}
