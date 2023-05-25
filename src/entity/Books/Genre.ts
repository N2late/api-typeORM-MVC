import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { BaseSchema } from '../utils/baseSchema';
import { Book } from './Book';

@Entity('genres')
export class Genre extends BaseSchema {
  @Column()
  type: string;

  @OneToMany(() => Book, (book) => book.genre)
  books: Book[];
}
