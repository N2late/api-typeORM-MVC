import { IncomingMessage, ServerResponse } from 'http';
import { ObjectType, getCustomRepository, getRepository } from 'typeorm';
import BaseController from './base.controller';
import {
  Author,
  Genre,
  User,
  Bookshelf,
  Rating,
  Book,
  BookRepository,
} from '../entity';
import authorization from '../authorization/authorization';
import ValidationService from './utils/validationService';
import ErrorHandler from '../errorHandling';
import ParamsBag from '../paramsBag';
import { BaseCrudOperations, HttpRequest } from './utils/baseCrudOperations';

class BookController extends BaseController<Book, BookRepository> {
  private crudOperations: BaseCrudOperations;
  constructor(bookRepository: ObjectType<BookRepository>) {
    const repository = getCustomRepository(bookRepository);
    super(repository);
    this.initializeRoutes('/books');
    this.crudOperations = new BaseCrudOperations(repository, this.path);
  }

  public async create(
    req: IncomingMessage & { body: any },
    res: ServerResponse,
  ) {
    try {
      req.body = await ParamsBag.parseRequestBody(req);

      await authorization.validateUserIdInSession(req, res, this.path);

      let author = await ValidationService.checkIfAuthorExists(
        req.body.authorName,
      );

      if (!author) {
        author = await this.createNewAuthor(req.body.authorName);
      }

      const book = await this.createNewBook(req.body, author);

      await this.repository.save(book);
      delete book.user.hashPassword;
      this.sendResponse(res, 201, book);
    } catch (err) {
      ErrorHandler.badRequest(res, err.message);
      return;
    }
  }

  public async index(
    req: IncomingMessage & { body: any },
    res: ServerResponse,
  ) {
    const queryParams = await ParamsBag.parseQueryParams(req);
    req.body = await ParamsBag.parseRequestBody(req);

    try {
      await authorization.validateUserIdInSession(req, res, this.path);
    } catch (err) {
      ErrorHandler.unauthorized(res, err.message);
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
      this.sendResponse(res, 200, books);
    } else {
      const books = await this.repository.getBooksByUserWithDetails(
        +req.body.userId,
      );
      this.sendResponse(res, 200, books);
    }
  }

  public async show(req: HttpRequest, res: ServerResponse) {
    await this.crudOperations.show(req, res);
  }

  public async update(req: HttpRequest, res: ServerResponse) {
    await this.crudOperations.update(req, res);
  }

  public async delete(req: HttpRequest, res: ServerResponse) {
    await this.crudOperations.delete(req, res);
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
