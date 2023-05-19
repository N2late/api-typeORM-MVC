import { Entity, Column, OneToMany } from 'typeorm';
import { BaseSchema } from './utils/baseSchema';
import { Session } from './Session';
import * as bcrypt from 'bcrypt';
import { IsEmail, Length, IsString } from 'class-validator';

// using the active record pattern with typeorm
@Entity('users')
export class User extends BaseSchema {
  @Column(
    'varchar',
    {
      length: 50,
      nullable: false,
    }
  )
  firstName: string;

  @Column(
    'varchar',
    {
      length: 50,
      nullable: false,
    }
  )
  lastName: string;

  @Column(
    'varchar',
    {
      length: 100,
      nullable: false
    }
  )
  @IsEmail()
  email: string;

  @Column(
    'varchar',
    {
      nullable: false,
    }
  )
  @Length(4, 30)
  @IsString()
  passwordHash: string;

  @OneToMany((type) => Session, (session) => session.user, {
    onDelete: 'CASCADE',
  })
  session: Session;

  async hashPassword(password: string) {
    this.passwordHash = await bcrypt.hash(password, 12);
  }

  async comparePassword(password: string) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}
