import { getCustomRepository } from 'typeorm';
import { Book, BookRepository } from '../entity/Books/Book';
import BaseController from './base.controller';

class RecommendationController extends BaseController<Book, BookRepository> {
  constructor() {
    super();
    this.repository = getCustomRepository(BookRepository);
    this.initializeRoutes('/recommendation');
  }

  public async index(req, res) {
    req.body = await this.parseBody(req);

    const userId = +req.body.userId;

    //function to get all the books from the user. Receive the title, author name, rating type, genre type and book shelf type
    const books = await this.repository
      .createQueryBuilder('book')
      .select('book.title', 'title')
      .addSelect('author.name', 'author')
      .leftJoin('book.author', 'author')
      .addSelect('rating.type', 'rating')
      .leftJoin('book.rating', 'rating')
      .addSelect('genre.type', 'genre')
      .leftJoin('book.genre', 'genre')
      .addSelect('bookshelf.state', 'bookshelf')
      .leftJoin('book.bookShelf', 'bookshelf')
      .where('book.user = :userId', { userId })
      .getRawMany();
    
  }
}

export default RecommendationController;
