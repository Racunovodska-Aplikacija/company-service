import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCompanySchema1765455376249 implements MigrationInterface {
    name = 'InitialCompanySchema1765455376249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "companyName" character varying(255) NOT NULL, "street" character varying(255) NOT NULL, "streetAdditional" character varying(255), "postalCode" character varying(20) NOT NULL, "city" character varying(255) NOT NULL, "iban" character varying(34) NOT NULL, "bic" character varying(11) NOT NULL, "registrationNumber" character varying(20) NOT NULL, "vatPayer" boolean NOT NULL DEFAULT false, "vatId" character varying(20), "additionalInfo" text, "documentLocation" character varying(255), "reverseCharge" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "companies"`);
    }
}
