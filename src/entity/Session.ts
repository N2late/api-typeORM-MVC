import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Timestamp,
  BeforeInsert,
} from 'typeorm';
import { BaseSchema } from './utils/baseSchema';
import { User } from './User';
import * as crypto from 'node:crypto';

@Entity('sessions')
export class Session extends BaseSchema {
  @Column({ default: crypto.randomBytes(80).toString('base64') })
  token: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  expiryTimestamp: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @BeforeInsert()
  setExpiryTimestamp() {
    this.expiryTimestamp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }

  checkIfExpired() {
    return this.expiryTimestamp < new Date();
  }
}
