import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../task.entity.js';
import { TasksService } from '../tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;
  // Mocked repository: no real database is touched.
  const repo = {
    create: vi.fn(),
    save: vi.fn(),
    findOneBy: vi.fn(),
  };
  const emitter = { emit: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repo },
        { provide: EventEmitter2, useValue: emitter },
      ],
    }).compile();
    service = moduleRef.get(TasksService);
  });

  it('create saves the task and emits task.created', async () => {
    const saved = { id: 1, title: 'Write tests', done: false, priority: 0 };
    repo.create.mockReturnValue({ title: 'Write tests' });
    repo.save.mockResolvedValue(saved);

    const result = await service.create('Write tests');

    expect(repo.create).toHaveBeenCalledWith({ title: 'Write tests' });
    expect(result).toEqual(saved);
    expect(emitter.emit).toHaveBeenCalledWith(
      'task.created',
      expect.objectContaining({ task: saved }),
    );
  });

  it('findOne returns the task when it exists', async () => {
    const task = { id: 1, title: 'Existing', done: false, priority: 0 };
    repo.findOneBy.mockResolvedValue(task);

    await expect(service.findOne(1)).resolves.toEqual(task);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('findOne throws NotFoundException when the task is missing', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('update throws NotFoundException for a missing task', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.update(99, { done: true })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });
});
