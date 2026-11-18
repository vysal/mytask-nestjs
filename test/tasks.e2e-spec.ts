import { config } from 'dotenv';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { App } from 'supertest/types.js';

config({ path: '.env.test', override: true, quiet: true });

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let taskId: number | undefined;
  let taskDeleted = false;

  beforeAll(async () => {
    const { AppModule } = await import('../src/app.module.js');
    const { TasksProcessor } = await import('../src/tasks/tasks.processor.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(getQueueToken('tasks'))
      .useValue({ add: async () => undefined })
      .overrideProvider(TasksProcessor)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    token = await app
      .get(JwtService)
      .signAsync({ sub: 1, email: 'e2e@example.com' });
  });

  afterAll(async () => {
    if (taskId !== undefined && !taskDeleted) {
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    }
    await app.close();
  });

  it('GET /tasks/:id returns 404 for a missing task', () => {
    return request(app.getHttpServer()).get('/tasks/2147483647').expect(404);
  });

  it('POST /tasks without a token is rejected with 401', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'No token' })
      .expect(401);
  });

  it('POST /tasks rejects an empty required title', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '' })
      .expect(400);
  });

  it('POST /tasks with a valid token creates and returns a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'E2E task' })
      .expect(201);

    expect(res.body).toMatchObject({
      title: 'E2E task',
      done: false,
      priority: 0,
    });
    taskId = res.body.id;
  });

  it('GET /tasks is public and lists the created task', async () => {
    const res = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toContainEqual(
      expect.objectContaining({ id: taskId, title: 'E2E task' }),
    );
  });

  it('GET /tasks/:id returns the created task', async () => {
    const res = await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .expect(200);

    expect(res.body).toMatchObject({ id: taskId, title: 'E2E task' });
  });

  it('PATCH /tasks/:id updates a task', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated E2E task', done: true })
      .expect(200);

    expect(res.body).toMatchObject({
      id: taskId,
      title: 'Updated E2E task',
      done: true,
    });
  });

  it('DELETE /tasks/:id removes the task', async () => {
    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    taskDeleted = true;

    await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404);
  });
});
