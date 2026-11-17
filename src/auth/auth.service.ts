import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register({ email, password }: RegisterDto) {
    const existing = await this.usersRepository.findOneBy({ email });
    if (existing) throw new ConflictException('Email is already registered');

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.usersRepository.save(
      this.usersRepository.create({ email, passwordHash: hash }),
    );
    this.logger.log(`User registered (id=${user.id})`);
    // Returned as an entity: ClassSerializerInterceptor strips passwordHash.
    return user;
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersRepository.findOneBy({ email });
    // Same message for unknown email and wrong password: don't reveal which.
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !valid) {
      this.logger.warn('Failed login attempt');
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return { accessToken };
  }
}
