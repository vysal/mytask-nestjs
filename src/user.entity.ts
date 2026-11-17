import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  // bcrypt hash, never the plain password. Column stays "password" in the DB.
  @Exclude()
  @Column({ name: 'password' })
  passwordHash!: string;
}
