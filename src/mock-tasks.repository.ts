import { Task } from './task.entity.js';

// In-memory stand-in for Repository<Task>, used when USE_MOCK_DB=true.
export class MockTasksRepository {
  private tasks: Task[] = [
    { id: 1, title: 'Learn NestJS', done: false, priority: 0 },
    { id: 2, title: 'Write DTOs', done: true, priority: 0 },
  ];
  private nextId = 3;

  create(data: Partial<Task>): Task {
    return { done: false, priority: 0, ...data } as Task;
  }

  async save(task: Task): Promise<Task> {
    if (!task.id) {
      task.id = this.nextId++;
      this.tasks.push(task);
    }
    return task;
  }

  async find() {
    return this.tasks;
  }

  async findBy(where: Partial<Task>) {
    return this.tasks.filter((t) => t.done === where.done);
  }

  async findOneBy(where: { id: number }) {
    return this.tasks.find((t) => t.id === where.id) ?? null;
  }

  async delete(id: number) {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return { affected: before - this.tasks.length, raw: [] };
  }
}
