import { ObjectType, getCustomRepository } from 'typeorm';
import { Book, BookRepository } from '../entity/Books/Book';
import BaseController from './base.controller';
import { aiPrompt, aiPromptWTR, promptOpenAI } from './utils/openAI';
import ErrorHandler from '../ErrorHandling';

class RecommendationController extends BaseController<Book, BookRepository> {
  constructor(BookRepository: ObjectType<BookRepository>) {
    const repository = getCustomRepository(BookRepository);
    super(repository);
    this.initializeRoutes('/recommendation');
  }

  public async index(req, res) {
    req.body = await this.parseBody(req);

    const userId = +req.body.userId;

    try {
      const books = await this.repository.getBooksByUserWithDetails(userId);

      const aiResponse = await promptOpenAI(aiPrompt(books));

      res.end(JSON.stringify(aiResponse));
    } catch (err) {
      ErrorHandler.handle(err, res);
    }
  }
}

export default RecommendationController;
