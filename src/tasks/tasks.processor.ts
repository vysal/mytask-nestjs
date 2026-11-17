import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

@Processor('tasks')
export class TasksProcessor extends WorkerHost {
  private readonly logger = new Logger(TasksProcessor.name);

  async process(job: Job<{ taskId: number; title: string }>) {
    if (job.name === 'send-reminder') {
      this.logger.log(
        `Reminder: task ${job.data.taskId} "${job.data.title}" (attempt ${job.attemptsMade + 1})`,
      );
    }
  }
}
