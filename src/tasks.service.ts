import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity.js';
import { UpdateTaskDto } from './tasks/dto/update-task.dto.js';
import { TaskCreatedEvent } from './tasks/task-created.event.js';
import { TaskUpdatedEvent } from './tasks/task-updated.event.js';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(title: string) {
    this.logger.debug(`Creating task with title "${title}"`);
    const task = this.tasksRepository.create({ title });
    const saved = await this.tasksRepository.save(task);
    this.logger.log(`Task created (id=${saved.id})`);
    this.eventEmitter.emit('task.created', new TaskCreatedEvent(saved));
    return saved;
  }

  async findAll() {
    return this.tasksRepository.find();
  }

  async findOne(id: number) {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) {
      this.logger.warn(`Task with id ${id} not found`);
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async update(id: number, changes: UpdateTaskDto) {
    const task = await this.findOne(id);
    Object.assign(task, changes);
    await this.tasksRepository.save(task);
    this.logger.log(`Task updated (id=${id})`);
    this.eventEmitter.emit(
      'task.updated',
      new TaskUpdatedEvent(task.id, task.title, task.done),
    );
    return task;
  }

  async remove(id: number) {
    const task = await this.findOne(id);
    const result = await this.tasksRepository.delete(id);
    if (!result.affected) {
      this.logger.warn(`Task with id ${id} not found`);
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    this.logger.log(`Task deleted (id=${id})`);
    return task;
  }

  async findTodo() {
    return this.tasksRepository.findBy({ done: false });
  }

  async findDone() {
    return this.tasksRepository.findBy({ done: true });
  }
}
