import { User } from './user.entity.js';

// In-memory stand-in for Repository<User>, used when USE_MOCK_DB=true.
export class MockUsersRepository {
  private users: User[] = [];
  private nextId = 1;

  create(data: Partial<User>): User {
    return Object.assign(new User(), data);
  }

  async save(user: User): Promise<User> {
    user.id = this.nextId++;
    this.users.push(user);
    return user;
  }

  async findOneBy(where: Partial<User>) {
    return this.users.find((u) => u.email === where.email) ?? null;
  }
}
