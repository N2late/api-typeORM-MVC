import { BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

export class BaseSchema extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
