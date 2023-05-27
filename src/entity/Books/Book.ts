import {
  Column,
  CreateDateColumn,
  Entity,
  EntityRepository,
  JoinColumn,
  ManyToOne,
  Repository,
} from 'typeorm';
import { User } from '../User';
import { Genre } from './Genre';
import { BaseSchema } from '../utils/baseSchema';
import { Bookshelf } from './Bookshelf';
import { Author } from './Author';
import { Rating } from './Rating';

@Entity('books')
export class Book extends BaseSchema {
  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  title: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Author, (author) => author.id)
  @JoinColumn({ name: 'authorId' })
  author: Author;

  @ManyToOne(() => Genre)
  @JoinColumn({ name: 'genreId' })
  genre: Genre;

  @ManyToOne(() => Bookshelf, (bookShelf) => bookShelf.id)
  @JoinColumn({ name: 'bookShelfId' })
  bookshelf: Bookshelf;

  @ManyToOne(() => Rating, (rating) => rating.id)
  @JoinColumn({ name: 'ratingId' })
  rating: Rating;
}

@EntityRepository(Book)
export class BookRepository extends Repository<Book> {
  public async findByShelfState(userId: number, shelfId: number): Promise<Book[]> {
    return this.createQueryBuilder('book')
      .where('book.bookShelfId = :shelfId', { shelfId })
      .andWhere('book.userId = :userId', { userId})
      .getMany();
  }

  public async findByUserId(userId: number): Promise<Book[]> {
    return this.createQueryBuilder('book')
      .where('book.userId = :userId', { userId })
      .getMany();
  }

  public async getBooksByUserWithDetails(userId: number): Promise<Book[]> {
    return this.createQueryBuilder('book')
      .select('book.title', 'title')
      .addSelect('author.name', 'author')
      .leftJoin('book.author', 'author')
      .addSelect('rating.type', 'rating')
      .leftJoin('book.rating', 'rating')
      .addSelect('genre.type', 'genre')
      .leftJoin('book.genre', 'genre')
      .addSelect('bookshelf.state', 'bookshelf')
      .leftJoin('book.bookshelf', 'bookshelf')
      .where('book.user = :userId', { userId })
      .getRawMany();
  }
}
