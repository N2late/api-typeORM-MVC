import { IncomingMessage, ServerResponse } from 'http';
import { ObjectType, getCustomRepository, getRepository } from 'typeorm';
import BaseController from './base.controller';
import {
  Author,
  Genre,
  User,
  Bookshelf,
  Rating,
  Session,
  Book,
  BookRepository,
} from '../entity';
import Authorization from '../authorization/authorization';
import ValidationService from './utils/validationService';
import ErrorHandler from '../errorHandling';
import ParamsBag from '../paramsBag';

class BookController extends BaseController<Book, BookRepository> {
  constructor(bookRepository: ObjectType<BookRepository>) {
    const repository = getCustomRepository(bookRepository);
    super(repository);
    this.initializeRoutes('/books');
  }

  public async create(req: IncomingMessage & { body: any}, res: ServerResponse) {
    try {
      req.body = await ParamsBag.parseRequestBody(req);
      const userSession = await Authorization.validateUserSession(
        req,
        res,
        this.path,
      );

      if (!userSession) {
        return;
      }

      if (userSession.user.id !== +req.body.userId) {
        ErrorHandler.unauthorized(res, 'Unauthorized');
        return;
      }

      let author = await ValidationService.checkIfAuthorExists(
        req.body.authorName,
      );

      if (!author) {
        author = await this.createNewAuthor(req.body.authorName);
      }

      const book = await this.createNewBook(req.body, author);

      await this.repository.save(book);
      res.end(JSON.stringify(`${book.title} was added to your bookshelf`));
    } catch (err) {
      ErrorHandler.badRequest(res, err.message);
      return;
    }
  }

  public async index(req: IncomingMessage & { body: any}, res: ServerResponse) {
    const queryParams = await ParamsBag.parseQueryParams(req);
    req.body = await ParamsBag.parseRequestBody(req);

    let session: Session;

    session = await Authorization.validateUserSession(req, res, this.path);

    if (!session || session.user.id !== +req.body.userId) {
      ErrorHandler.unauthorized(res, 'Unauthorized');
      return;
    }

    if (queryParams.get('shelf')) {
      const shelfState = queryParams.get('shelf');

      const { id } = await getRepository(Bookshelf).findOne({
        where: { state: shelfState },
        select: ['id'],
      });

      const books = await this.repository.findByShelfState(
        +req.body.userId,
        id,
      );
      res.end(JSON.stringify(books));
    } else {
      const books = await this.repository.getBooksByUserWithDetails(
        +req.body.userId,
      );
      res.end(JSON.stringify(books));
    }
  }

  private async createNewAuthor(authorName: string) {
    const newAuthor = new Author();
    newAuthor.name = authorName;
    return await getRepository(Author).save(newAuthor);
  }

  private async createNewBook(body: any, author: Author) {
    const book = new Book();

    book.title = body.title;
    book.author = author;
    book.genre = await getRepository(Genre).findOne(body.genreId);
    book.user = await getRepository(User).findOne(body.userId);
    book.bookshelf = await getRepository(Bookshelf).findOne(body.bookShelfId);
    book.rating = await getRepository(Rating).findOne(body.ratingId);

    return book;
  }
}

export default BookController;
