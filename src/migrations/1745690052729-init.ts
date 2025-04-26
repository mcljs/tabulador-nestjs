import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1745690052729 implements MigrationInterface {
    name = 'Init1745690052729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "const_p2_hasta100_km" double precision NOT NULL DEFAULT '0.05'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "const_p1_hasta100_km" double precision NOT NULL DEFAULT '2'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "const_p2_hasta250_km" double precision NOT NULL DEFAULT '0.05'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "const_p1_hasta250_km" double precision NOT NULL DEFAULT '1.5'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "const_p2_hasta600_km" double precision NOT NULL DEFAULT '0.03'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "const_p1_hasta600_km" double precision NOT NULL DEFAULT '0.5'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "const_p2_desde600_km" double precision NOT NULL DEFAULT '0.06'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ADD "const_p1_desde600_km" double precision NOT NULL DEFAULT '0.5'`);
        await queryRunner.query(`ALTER TABLE "configuracion" ALTER COLUMN "porcentaje_proteccion" SET DEFAULT '0.035'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "configuracion" ALTER COLUMN "porcentaje_proteccion" SET DEFAULT '0.01'`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "const_p1_desde600_km"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "const_p2_desde600_km"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "const_p1_hasta600_km"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "const_p2_hasta600_km"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "const_p1_hasta250_km"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "const_p2_hasta250_km"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "const_p1_hasta100_km"`);
        await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "const_p2_hasta100_km"`);
    }

}
