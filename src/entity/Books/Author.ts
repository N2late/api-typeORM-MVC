import { Column, Entity } from 'typeorm';
import { BaseSchema } from '../utils/baseSchema';

@Entity('authors')
export class Author extends BaseSchema {
  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  name: string;
}
