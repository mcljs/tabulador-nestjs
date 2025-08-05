import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentInfoToEnvio1754418109618 implements MigrationInterface {
    name = 'AddPaymentInfoToEnvio1754418109618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "numero_transferencia" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "fecha_pago" date`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "hora_pago" TIME`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "banco_emisor" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD "comprobante_pago" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "comprobante_pago"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "banco_emisor"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "hora_pago"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "fecha_pago"`);
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP COLUMN "numero_transferencia"`);
    }

}
