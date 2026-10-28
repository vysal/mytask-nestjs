import { Injectable, NotFoundException } from '@nestjs/common';
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
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) throw new NotFoundException(`Task with id ${id} not found`);
    return task;
  }

  async update(id: number, done: boolean) {
    const task = await this.findOne(id);
    task.done = done;
    await this.tasksRepository.save(task);
    return task;
  }

  async remove(id: number) {
    const task = await this.findOne(id);
    const result = await this.tasksRepository.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Task with id ${id} not found`);
    return task;
  }

  async findTodo() {
    return this.tasksRepository.findBy({ done: false });
  }

  async findDone() {
    return this.tasksRepository.findBy({ done: true });
  }
}
