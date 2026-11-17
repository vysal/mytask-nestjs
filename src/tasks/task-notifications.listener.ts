import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { OnEvent } from '@nestjs/event-emitter';
import type { Queue } from 'bullmq';
import { TaskCreatedEvent } from './task-created.event.js';
import { TaskUpdatedEvent } from './task-updated.event.js';

@Injectable()
export class TaskNotificationsListener {
  private readonly logger = new Logger(TaskNotificationsListener.name);

  constructor(@InjectQueue('tasks') private readonly tasksQueue: Queue) {}

  @OnEvent('task.created')
  async handleTaskCreated(event: TaskCreatedEvent) {
    this.logger.log(
      `New task created: "${event.task.title}" (id=${event.task.id})`,
    );
    await this.tasksQueue.add(
      'send-reminder',
      { taskId: event.task.id, title: event.task.title },
      { delay: 5000, attempts: 3, backoff: { type: 'fixed', delay: 2000 } },
    );
  }

  @OnEvent('task.updated')
  handleTaskUpdated(event: TaskUpdatedEvent) {
    this.logger.log(
      `Task ${event.id} updated: "${event.title}", done: ${event.done}`,
    );
  }
}
