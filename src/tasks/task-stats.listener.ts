import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TaskUpdatedEvent } from './task-updated.event.js';

@Injectable()
export class TaskStatsListener {
  private readonly logger = new Logger(TaskStatsListener.name);
  private createdCount = 0;
  private doneCount = 0;

  @OnEvent('task.created')
  handleTaskCreated() {
    this.createdCount++;
    this.logger.log(`Tasks created so far: ${this.createdCount}`);
  }

  @OnEvent('task.updated')
  handleTaskUpdated(event: TaskUpdatedEvent) {
    if (!event.done) return;
    this.doneCount++;
    this.logger.log(`Updates marking a task done so far: ${this.doneCount}`);
  }
}
