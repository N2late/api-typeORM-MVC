import { ObjectType, Repository, getRepository } from 'typeorm';
import { Author } from '../entity/Books/Author';
import BaseController from './base.controller';
import { BaseCrudOperations } from './utils/baseCrudOperations';

class AuthorController extends BaseController<Author, Repository<Author>> {
  private crudOperations: BaseCrudOperations;
  constructor(Author: ObjectType<Author>) {
    const repository = getRepository(Author);
    super(repository);
    this.initializeRoutes('/authors');
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

export default AuthorController;
