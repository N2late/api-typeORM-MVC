import { getCustomRepository } from 'typeorm';
import { Book, BookRepository } from '../entity/Books/Book';
import BaseController from './base.controller';
import { aiPrompt, aiPromptWTR, promptOpenAI } from './utils/openAI';

class RecommendationController extends BaseController<Book, BookRepository> {
  constructor() {
    super();
    this.repository = getCustomRepository(BookRepository);
    this.initializeRoutes('/recommendation');
  }

  public async index(req, res) {
    req.body = await this.parseBody(req);

    const userId = +req.body.userId;


    const books = await this.repository.getBooksByUserWithDetails(userId);

    const aiResponse = await promptOpenAI(aiPrompt(books));

    res.end(JSON.stringify(aiResponse));

  }
}

export default RecommendationController;
