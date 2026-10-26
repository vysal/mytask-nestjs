import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskPriority1793000001000 implements MigrationInterface {
  name = 'AddTaskPriority1793000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tasks" ADD "priority" integer NOT NULL DEFAULT 0',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "tasks" DROP COLUMN "priority"');
  }
}
