import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { getSslOptions } from './db-ssl.js';
import { MockTasksRepository } from './mock-tasks.repository.js';
import { MockUsersRepository } from './mock-users.repository.js';
import { Task } from './task.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TasksProcessor } from './tasks/tasks.processor.js';
import { TaskNotificationsListener } from './tasks/task-notifications.listener.js';
import { TaskStatsListener } from './tasks/task-stats.listener.js';
import { User } from './user.entity.js';

const useMockDb = process.env.USE_MOCK_DB === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: Number(config.get<string>('REDIS_PORT') ?? 6379),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'tasks' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    ...(useMockDb
      ? []
      : [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              type: 'postgres',
              host: config.getOrThrow<string>('DB_HOST'),
              port: Number(config.getOrThrow<string>('DB_PORT')),
              username: config.getOrThrow<string>('DB_USERNAME'),
              password: config.getOrThrow<string>('DB_PASSWORD'),
              database: config.getOrThrow<string>('DB_DATABASE'),
              ssl: getSslOptions({
                DB_SSL: config.get<string>('DB_SSL'),
                DB_SSL_CA: config.get<string>('DB_SSL_CA'),
              }),
              autoLoadEntities: true,
              synchronize: false,
            }),
          }),
          TypeOrmModule.forFeature([Task, User]),
        ]),
  ],
  controllers: [AppController, TasksController, AuthController],
  providers: [
    AppService,
    TasksService,
    AuthService,
    TaskNotificationsListener,
    TaskStatsListener,
    TasksProcessor,
    ...(useMockDb
      ? [
          { provide: getRepositoryToken(Task), useClass: MockTasksRepository },
          { provide: getRepositoryToken(User), useClass: MockUsersRepository },
        ]
      : []),
  ],
})
export class AppModule {}
