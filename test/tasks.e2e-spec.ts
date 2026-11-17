import { config } from 'dotenv';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { App } from 'supertest/types.js';

// Load the test database settings before AppModule is imported.
config({ path: '.env.test', override: true, quiet: true });

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const { AppModule } = await import('../src/app.module.js');
    const { TasksProcessor } = await import('../src/tasks/tasks.processor.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(getQueueToken('tasks'))
      .useValue({ add: async () => undefined }) // no Redis needed in e2e
      .overrideProvider(TasksProcessor)
      .useValue({}) // don't start a Redis-backed worker in e2e
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    token = await app
      .get(JwtService)
      .signAsync({ sub: 1, email: 'e2e@example.com' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tasks is public and returns an array', async () => {
    const res = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /tasks without a token is rejected with 401', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'No token' })
      .expect(401);
  });

  it('POST /tasks with a valid token creates a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'E2E task' })
      .expect(201);
    expect(res.body).toMatchObject({ title: 'E2E task', done: false });
  });
});
