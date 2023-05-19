import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseSchema } from './utils/baseSchema';
import { User } from './User';
import * as crypto from 'node:crypto';
import setUnixTimestampTomorrow from './utils/setUnixTimestampTomorrow';

@Entity('sessions')
export class Session extends BaseSchema {
  @Column({
    type: 'varchar',
    default: crypto.randomBytes(80).toString('base64'),
  })
  token: string;

  @Column({
    type: 'bigint',
    default: setUnixTimestampTomorrow(),
    nullable: false,
  })
  expiryTimestamp: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
