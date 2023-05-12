import { Entity, Column } from 'typeorm';
import { BaseSchema } from './utils/baseSchema';

// using the active record pattern with typeorm
@Entity('users')
export class User extends BaseSchema {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;
}

/* export class UserModel {
  public users: Repository<User>;
  constructor() {
    this.users = getRepository(User);
  }

  async save(user: User) {
    return await this.users.save(user);
  }
} */
