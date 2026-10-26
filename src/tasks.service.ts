import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async create(title: string) {
    const task = this.tasksRepository.create({ title });
    return this.tasksRepository.save(task);
  }

  async findAll() {
    return this.tasksRepository.find();
  }

  async findOne(id: number) {
    return (await this.tasksRepository.findOneBy({ id })) ?? undefined;
  }

  async update(id: number, done: boolean) {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) return undefined;

    task.done = done;
    await this.tasksRepository.save(task);
    return task;
  }

  async remove(id: number) {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) return undefined;

    await this.tasksRepository.remove(task);
    return task;
  }

  async findTodo() {
    return this.tasksRepository.findBy({ done: false });
  }

  async findDone() {
    return this.tasksRepository.findBy({ done: true });
  }
}
