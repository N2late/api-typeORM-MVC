import { Entity, Column, OneToOne } from 'typeorm';
import { BaseSchema } from './utils/baseSchema';
import { Session } from './Session';
import bcrypt from 'bcrypt';

// using the active record pattern with typeorm
@Entity('users')
export class User extends BaseSchema {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @OneToOne((type) => Session, (session) => session.user)
  session: Session;

  async hashPassword(password: string) {
    this.passwordHash = await bcrypt.hash(password, 12);
  }
}
