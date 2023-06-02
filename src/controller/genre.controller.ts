import { getRepository, ObjectType, Repository } from 'typeorm';
import { Genre } from '../entity/Books/Genre';
import BaseController from './base.controller';
import { BaseCrudOperations } from './utils/baseCrudOperations';

class GenreController extends BaseController<Genre, Repository<Genre>> {
  private crudOperations: BaseCrudOperations;

  constructor(Genre: ObjectType<Genre>) {
    const repository = getRepository(Genre);
    super(repository);
    this.initializeRoutes('/genres');
    this.crudOperations = new BaseCrudOperations(repository, this.path);
  }

  public async index(req: any, res: any): Promise<void> {
    await this.crudOperations.index(req, res);
  }

  public async show(req: any, res: any): Promise<void> {
    await this.crudOperations.show(req, res);
  }

  public async update(req: any, res: any): Promise<void> {
    await this.crudOperations.update(req, res);
  }
  
}

export default GenreController;
