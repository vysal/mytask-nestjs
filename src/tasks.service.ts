import { Injectable } from '@nestjs/common';

const fakeDatabaseDelay = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 300));

@Injectable()
export class TasksService {
  private readonly tasks = [
    { id: 1, title: 'Install Node.js and VS Code', done: true },
    { id: 2, title: 'Create the mytasks project', done: true },
    { id: 3, title: 'Finish the NestJS controller lesson', done: false },
    { id: 4, title: 'Review JavaScript arrays and objects', done: false },
    { id: 5, title: 'Submit Task 1.6 to my instructor', done: false },
  ];

  private nextId = 6;

  async create(title: string) {
    await fakeDatabaseDelay();
    const task = { id: this.nextId++, title, done: false };
    this.tasks.push(task);
    return task;
  }

  async findAll() {
    await fakeDatabaseDelay();
    return this.tasks;
  }

  async findOne(id: number) {
    await fakeDatabaseDelay();
    return this.tasks.find((task) => task.id === id);
  }

  async update(id: number, done: boolean) {
    await fakeDatabaseDelay();
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      task.done = done;
    }
    return task;
  }

  async remove(id: number) {
    await fakeDatabaseDelay();
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return undefined;
    }
    const [removed] = this.tasks.splice(index, 1);
    return removed;
  }

  async findTodo() {
    await fakeDatabaseDelay();
    return this.tasks.filter((task) => task.done === false);
  }

  async findDone() {
    await fakeDatabaseDelay();
    return this.tasks.filter((task) => task.done === true);
  }
}
