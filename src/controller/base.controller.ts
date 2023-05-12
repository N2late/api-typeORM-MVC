import { EntitySchema, ObjectType, Repository, getRepository } from 'typeorm';
import { Router } from '../router';

abstract class BaseController<Entity> {
  protected path = '/';
  public router = new Router();
  public repository: Repository<Entity>;
  constructor() {
    // bind index to this
    this.index = this.index.bind(this);
  }

  public initializeRoutes(path: string) {
    this.path = path;
    this.router.get(this.path, this.index);
  }

  public async index(req: any, res: any) {
    const entities = await this.repository.find();
    console.log(entities);
    res.end(JSON.stringify(entities));
  }
}
export default BaseController;
