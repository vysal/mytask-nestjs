import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1793000000000 implements MigrationInterface {
  name = 'CreateTasksTable1793000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" SERIAL NOT NULL,
        "title" character varying NOT NULL,
        "done" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "tasks"');
  }
}
