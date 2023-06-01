import { ObjectType, getCustomRepository } from 'typeorm';
import { Book, BookRepository } from '../entity/Books/Book';
import BaseController from './base.controller';
import { aiPrompt, aiPromptWTR, promptOpenAI } from './utils/openAI';
import ErrorHandler from '../ErrorHandling';
import authorization from '../authorization/authorization';
import { URL } from 'url';

class RecommendationController extends BaseController<Book, BookRepository> {
  constructor(BookRepository: ObjectType<BookRepository>) {
    const repository = getCustomRepository(BookRepository);
    super(repository);
    this.initializeRoutes('/recommendation');
  }

  public async index(req, res) {
    req.body = await this.parseBody(req);
    const userId = +req.body.userId;

    const session = await authorization.validateUserSession(
      req,
      res,
      this.path,
    );

    if (!session) return;

    if (session.user.id !== req.body.userId) {
      ErrorHandler.unauthorized(res, 'Unauthorized');
      return;
    }

    const url = new URL(req.url, 'http://localhost:3000');
    const queryParam = url.searchParams.get('type');
    const books = await this.repository.getBooksByUserWithDetails(userId);
    
    try {
        if (queryParam === 'want-to-read') {
          const aiResponse = await promptOpenAI(aiPromptWTR(books));
          res.end(JSON.stringify(aiResponse));

      } else if (queryParam === 'random'){
          const aiResponse = await promptOpenAI(aiPrompt(books));
          res.end(JSON.stringify(aiResponse));
      } else {
        ErrorHandler.badRequest(res, 'Invalid query parameter');
      }
    } catch (err) {
      ErrorHandler.handle(err, res);
      return;
    }
  }
}

export default RecommendationController;
