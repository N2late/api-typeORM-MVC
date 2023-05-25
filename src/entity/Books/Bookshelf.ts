import { Column, Entity } from 'typeorm';
import { BaseSchema } from '../utils/baseSchema';

@Entity('bookshelves')
export class Bookshelf extends BaseSchema {
  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  state: string;
}
