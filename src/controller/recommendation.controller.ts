import { ObjectType, getCustomRepository } from 'typeorm';
import { Book, BookRepository } from '../entity/Books/Book';
import BaseController from './base.controller';
import ErrorHandler from '../errorHandling';
import authorization from '../authorization/authorization';
import ParamsBag from '../paramsBag';
import { aiPrompt, aiPromptWTR, promptOpenAI } from './utils/openAI';
import { IncomingMessage, ServerResponse } from 'http';

class RecommendationController extends BaseController<Book, BookRepository> {
  constructor(BookRepository: ObjectType<BookRepository>) {
    const repository = getCustomRepository(BookRepository);
    super(repository);
    this.initializeRoutes('/recommendation');
  }

  public async index(req: IncomingMessage & { body: any },
    res: ServerResponse,) {
    try {
      req.body = await ParamsBag.parseRequestBody(req);
      const userId = +req.body.userId;

      await authorization.validateUserIdInSession(req, res, this.path);

      const queryParams = await ParamsBag.parseQueryParams(req);
      const books = await this.repository.getBooksByUserWithDetails(userId);
      const aiRecommendedBook = await this.getAIRecommendedBook(books, queryParams.get('type'));

      this.sendResponse(res, 200, aiRecommendedBook);
    } catch (err) {
      ErrorHandler.badRequest(res, err.message);
    }
  }

  private async getAIRecommendedBook(books: Book[], queryParam: string) {
    if (queryParam === 'want-to-read') {
      return await promptOpenAI(aiPromptWTR(books));
    } else if (queryParam === 'random') {
      return await promptOpenAI(aiPrompt(books));
    } else {
      throw new Error('Invalid query parameter');
    }
  }
}

export default RecommendationController;
