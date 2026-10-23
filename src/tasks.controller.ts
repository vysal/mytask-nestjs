import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserAgent } from './common/user-agent.decorator.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body('title') title: string) {
    return this.tasksService.create(title);
  }

  @Get('todo')
  findTodo() {
    return this.tasksService.findTodo();
  }

  @Get('done')
  findDone() {
    return this.tasksService.findDone();
  }

  @Get('welcome')
  welcome(): string {
    return 'Welcome to MyTasks! Glad to have you here.';
  }

  @Get('agent')
  whoIsAsking(@UserAgent() agent: string) {
    return { agent };
  }

  // Must stay last: ':id' matches any segment, so it would swallow
  // /tasks/todo, /tasks/done, /tasks/welcome and /tasks/agent if declared earlier.
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findOne(Number(id));
    return task;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('done') done: boolean) {
    return this.tasksService.update(Number(id), done);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(Number(id));
  }
}
