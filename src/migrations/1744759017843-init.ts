import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1744759017843 implements MigrationInterface {
    name = 'Init1744759017843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "cantidad_peajes" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "costo_peaje" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "total_peaje" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "costo_peaje_susuki" double precision NOT NULL DEFAULT '0.8'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "costo_peaje_l300" double precision NOT NULL DEFAULT '0.8'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "costo_peaje_nhr" double precision NOT NULL DEFAULT '1.2'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "costo_peaje_canter_corta" double precision NOT NULL DEFAULT '1.2'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "costo_peaje_canter_larga" double precision NOT NULL DEFAULT '1.2'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "costo_peaje_platforma" double precision NOT NULL DEFAULT '1.2'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "costo_peaje_pitman" double precision NOT NULL DEFAULT '1.2'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "costo_peaje_chuto" double precision NOT NULL DEFAULT '6'`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "aplicable_hospedaje"`);
        await queryRunner.query(`DROP TYPE "public"."configuracion_aplicable_hospedaje_enum"`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "aplicable_hospedaje" character varying NOT NULL DEFAULT 'EXPRESS'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "aplicable_hospedaje"`);
        await queryRunner.query(`CREATE TYPE "public"."configuracion_aplicable_hospedaje_enum" AS ENUM('EXPRESS', 'TODOS')`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "aplicable_hospedaje" "public"."configuracion_aplicable_hospedaje_enum" NOT NULL DEFAULT 'EXPRESS'`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "costo_peaje_chuto"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "costo_peaje_pitman"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "costo_peaje_platforma"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "costo_peaje_canter_larga"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "costo_peaje_canter_corta"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "costo_peaje_nhr"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "costo_peaje_l300"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "costo_peaje_susuki"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "total_peaje"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "costo_peaje"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "cantidad_peajes"`);
    }

}
