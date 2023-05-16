import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { BaseSchema } from './utils/baseSchema';
import { Session } from './Session';
import * as bcrypt from 'bcrypt';
import { IsEmail, Length, IsString } from 'class-validator';

// using the active record pattern with typeorm
@Entity('users')
export class User extends BaseSchema {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @Length(4, 30)
  @IsString()
  passwordHash: string;

  @OneToMany((type) => Session,(session) => session.user, {
    onDelete: 'CASCADE'
  })
  session: Session;

  async hashPassword(password: string) {
    console.log('hashing password: ', password);
    this.passwordHash = await bcrypt.hash(password, 12);
  }

  async comparePassword(password: string) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}
