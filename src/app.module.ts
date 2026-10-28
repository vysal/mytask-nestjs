import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MockTasksRepository } from './mock-tasks.repository.js';
import { Task } from './task.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

const useMockDb = process.env.USE_MOCK_DB === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
              autoLoadEntities: true,
              synchronize: false,
            }),
          }),
          TypeOrmModule.forFeature([Task]),
        ]),
  ],
  controllers: [AppController, TasksController],
  providers: [
    AppService,
    TasksService,
    ...(useMockDb
      ? [{ provide: getRepositoryToken(Task), useClass: MockTasksRepository }]
      : []),
  ],
})
export class AppModule {}
