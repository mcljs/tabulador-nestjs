import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1741465538717 implements MigrationInterface {
    name = 'Init1741465538717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('BASIC', 'CREATOR', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "username" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "phone" character varying NOT NULL, "document_type" character varying NOT NULL, "document_number" character varying NOT NULL, "date_of_birth" character varying NOT NULL, "city" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_5f6c1b67ac12a1e7eb454a48e59" UNIQUE ("document_number"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."envio_entity_tipo_envio_enum" AS ENUM('NORMAL', 'EXPRESS')`);
        await queryRunner.query(`CREATE TABLE "envio_entity" ("id" SERIAL NOT NULL, "distancia" double precision NOT NULL, "peso" integer, "valor_declarado" double precision NOT NULL, "flete" double precision NOT NULL, "proteccion_encomienda" double precision NOT NULL, "subtotal" double precision NOT NULL, "iva" double precision NOT NULL, "franqueo_postal" double precision NOT NULL, "total_a_pagar" double precision NOT NULL, "tracking_number" character varying NOT NULL, "status" character varying NOT NULL, "rute_initial" character varying, "rute_finish" character varying, "tipo_articulo" character varying NOT NULL, "tipo_envio" "public"."envio_entity_tipo_envio_enum" NOT NULL DEFAULT 'NORMAL', "es_sobre" boolean NOT NULL DEFAULT false, "ancho" double precision, "alto" double precision, "largo" double precision, "volumen" double precision, "tipo_vehiculo" character varying, "costo_hospedaje" double precision NOT NULL DEFAULT '0', "user_id" uuid, CONSTRAINT "PK_c4a2d6487e7a24abc5f52264d4c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."configuracion_aplicable_hospedaje_enum" AS ENUM('EXPRESS', 'TODOS')`);
        await queryRunner.query(`CREATE TABLE "configuracion" ("id" SERIAL NOT NULL, "costo_por_km" double precision NOT NULL DEFAULT '0.003', "costo_gasolina" double precision NOT NULL DEFAULT '0.49', "porcentaje_proteccion" double precision NOT NULL DEFAULT '0.01', "proteccion_minima" double precision NOT NULL DEFAULT '5', "franqueo_postal" double precision NOT NULL DEFAULT '2', "costo_hospedaje" double precision NOT NULL DEFAULT '30', "aplicable_hospedaje" "public"."configuracion_aplicable_hospedaje_enum" NOT NULL DEFAULT 'EXPRESS', "consumo_susuki_eeco" double precision NOT NULL DEFAULT '0.08', "consumo_mitsubishi_l300" double precision NOT NULL DEFAULT '0.12', "consumo_nhr" double precision NOT NULL DEFAULT '0.14', "consumo_canter_cava_corta" double precision NOT NULL DEFAULT '0.18', "consumo_canter_cava_larga" double precision NOT NULL DEFAULT '0.25', CONSTRAINT "PK_42615c5e55d08746ae5accfc295" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "envio_entity" ADD CONSTRAINT "FK_79f2f0edb2dfdb2fa40323ec161" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "envio_entity" DROP CONSTRAINT "FK_79f2f0edb2dfdb2fa40323ec161"`);
        await queryRunner.query(`DROP TABLE "configuracion"`);
        await queryRunner.query(`DROP TYPE "public"."configuracion_aplicable_hospedaje_enum"`);
        await queryRunner.query(`DROP TABLE "envio_entity"`);
        await queryRunner.query(`DROP TYPE "public"."envio_entity_tipo_envio_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
