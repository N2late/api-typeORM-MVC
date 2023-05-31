import { ObjectType, getCustomRepository, getRepository} from 'typeorm';
import BaseController from './base.controller';
import { Book, BookRepository } from '../entity/Books/Book';
import { Genre } from '../entity/Books/Genre';
import { User } from '../entity/User';
import { Bookshelf } from '../entity/Books/Bookshelf';
import { Rating } from '../entity/Books/Rating';
import { Author } from '../entity/Books/Author';
import { Session } from '../entity/Session';
import { URL } from 'url';
import Authorization from '../authorization/authorization';

class BookController extends BaseController<Book, BookRepository> {
  constructor(bookRepository: ObjectType<BookRepository>) {
    const repository = getCustomRepository(bookRepository);
    super(repository);
    this.initializeRoutes('/books');
  }

  public async create(req, res) {
    req.body = await this.parseBody(req);
    let session: Session;
    session = await Authorization.validateUserSession(req, res, this.path);

    if (!session || session.user.id !== +req.body.userId) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: 'Unauthorized' }));
      return;
    }

    const author = await this.checkIfAuthorExists(req.body.authorName);

    if (!author) {
      const newAuthor = new Author();
      newAuthor.name = req.body.authorName;
      await getRepository(Author).save(newAuthor);
    }

    const book = new Book();

    book.title = req.body.title;
    book.author = await getRepository(Author).findOne({
      name: req.body.authorName,
    });
    book.genre = await getRepository(Genre).findOne(req.body.genreId);
    book.user = await getRepository(User).findOne(req.body.userId);
    book.bookshelf = await getRepository(Bookshelf).findOne(
      req.body.bookShelfId,
    );
    book.rating = await getRepository(Rating).findOne(req.body.ratingId);

    try {
      await this.repository.save(book);
      res.end(JSON.stringify(book));
    } catch (err) {
      this.handleErrors(err, res);
      return;
    }
  }

  public async index(req, res) {
    const url = new URL(req.url, 'http://localhost:3000');
    const queryParams = url.searchParams;
    req.body = await this.parseBody(req);

    let session: Session;

    session = await Authorization.validateUserSession(req, res, this.path);

    if (!session) {
      return;
    }

    if (!session || session.user.id !== +req.body.userId) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: 'Unauthorized' }));
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
      const books = await this.repository.findByUserId(+req.body.userId);
      res.end(JSON.stringify(books));
    }
  }
  private async checkIfAuthorExists(authorName: string) {
    const author = await getRepository(Author).findOne({ name: authorName });
    if (author) {
      return author;
    }
    return null;
  }
}

export default BookController;
