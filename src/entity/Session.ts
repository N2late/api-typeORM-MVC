import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseSchema } from './utils/baseSchema';
import { User } from './User';

@Entity('sessions')
export class Session extends BaseSchema {
  @Column()
  token: string;

  @Column()
  expiry_timestamp: Date;

  @OneToOne((type) => User, (user) => user.session)
  @JoinColumn({ name: 'userId' })
  user: User;
}
