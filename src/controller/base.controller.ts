import { Repository } from 'typeorm';
import { Router } from '../router';

abstract class BaseController<Entity> {
  protected path = '/';
  public router = new Router();
  public repository: Repository<Entity>;
  constructor() {
    // bind index to this
    this.index = this.index.bind(this);
    this.create = this.create.bind(this);
    this.parseBody = this.parseBody.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    /*  this.errorHandling = this.errorHandling.bind(this); */
  }

  public initializeRoutes(path: string) {
    this.path = path;
    if(this.path !== '/signup' && this.path !== '/login') {
    this.router.get(this.path, this.index);

    this.router.put(`${this.path}/:id`, this.update);
    this.router.delete(`${this.path}/:id`, this.delete);
    }

    this.router.post(this.path, this.create);
  }

  public async index(req: any, res: any) {
    try {
      const entities = await this.repository.find();
      console.log(entities);
      res.end(JSON.stringify(entities));
    } catch (err) {
      /*  this.errorHandling(err, res); */
    }
  }

  public async create(req: any, res: any) {
    console.log('creating entity');
    try {
      req.body = await this.parseBody(req);
      console.log(req.body);
      const entity = await this.repository.save(req.body);
      res.statusCode = 201;
      res.end(JSON.stringify(entity));
    } catch (err) {
      console.log(err);
      /* this.errorHandling(err, res); */
    }
  }

  public async update(req: any, res: any) {
    try {
      const [, , userId] = req.url.split('/');
      req.body = await this.parseBody(req);
      const updatedEntity = await this.repository.update(userId, req.body);
      res.statusCode = 200;
      res.end(JSON.stringify(updatedEntity));
    } catch (err) {
      console.log(err);
      /* this.errorHandling(err, res); */
    }
  }

  public async delete(req: any, res: any) {
    try {
      const [, , userId] = req.url.split('/');
      const deletedEntity = await this.repository.delete(userId);
      res.statusCode = 200;
      res.end(JSON.stringify(deletedEntity));
    } catch (err) {
      console.log(err);
      /* this.errorHandling(err, res); */
    }
  }

  /* errorHandling(err: any, res: any) {
    let statusCode = err.status || 500;

    res.end(err.message);
  } */
  protected async parseBody(req: any) {
    req.body = '';
    await req.on('data', (chunk) => {
      req.body += chunk.toString();
    });

    return JSON.parse(req.body);
  }
}
export default BaseController;
