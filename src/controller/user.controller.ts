import { ObjectType, Repository, getRepository } from 'typeorm';
import BaseController from './base.controller';
import { User } from '../entity/User';
import { ServerResponse } from 'http';
import { BaseCrudOperations, HttpRequest } from './utils/baseCrudOperations';

class UserController extends BaseController<User, Repository<User>> {
  private crudOperations: BaseCrudOperations;
  constructor(User: ObjectType<User>) {
    const repository = getRepository(User);
    super(repository);
    this.initializeRoutes('/users');
    this.crudOperations = new BaseCrudOperations(repository, this.path);
  }

  public async update(req: HttpRequest, res: ServerResponse): Promise<void> {
    await this.crudOperations.update(req, res);
  }

  public async show(req: HttpRequest, res: ServerResponse): Promise<void> {
    await this.crudOperations.show(req, res);
  }

  public async delete(req: HttpRequest, res: ServerResponse): Promise<void> {
    await this.crudOperations.delete(req, res);
  }
}

export default UserController;
