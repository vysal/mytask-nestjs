import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserAgent } from './common/user-agent.decorator.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './tasks/dto/create-task.dto.js';
import { UpdateTaskDto } from './tasks/dto/update-task.dto.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto.title);
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const task = await this.tasksService.findOne(id);
    return task;
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto.done);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
