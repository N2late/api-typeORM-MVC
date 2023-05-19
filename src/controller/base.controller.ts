import { MoreThan, Repository, getRepository } from 'typeorm';
import { Router } from '../router';
import { Session } from '../entity/Session';
import { getTokenFromCookie } from './utils/utils';
import { User } from '../entity/User';

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
    this.show = this.show.bind(this);
    this.getValidUserSessionByToken = this.getValidUserSessionByToken.bind(this);
    /*  this.errorHandling = this.errorHandling.bind(this); */
  }

  public initializeRoutes(path: string) {
    this.path = path;
    if (this.path !== '/signup' && this.path !== '/login') {
      this.router.get(this.path, this.index);
      this.router.get(`${this.path}/:id`, this.show);
      this.router.put(`${this.path}/:id`, this.update);
      this.router.delete(`${this.path}/:id`, this.delete);
    }
    if (!this.path.includes('/users')) this.router.post(this.path, this.create);
  }

  public async index(req: any, res: any) {

    try {
      const entities = await this.repository.find();

      res.end(JSON.stringify(entities));
    } catch (err) {
      /*  this.errorHandling(err, res); */
    }
  }

  public async show(req: any, res: any) {
    const [, , userId] = req.url.split('/');
    let token: string | Error;
    try {
      token = getTokenFromCookie(req.headers.cookie);
    } catch (err) {
      res.statusCode = 401;
      res.end(JSON.stringify(err.message));
    }

    const session = await this.getValidUserSessionByToken(token as string);

    if (session.user.id !== +userId) {
      res.statusCode = 401;
      res.end(JSON.stringify('Unauthorized'));
      return;
    }

    try {
      const entity = await this.repository.findOne(session.user.id);
      if (entity instanceof User) {
        delete entity.passwordHash;
      }
      res.end(JSON.stringify(entity));
    } catch (err) {
      console.log(err);
    }
  }

  public async create(req: any, res: any) {

    try {
      req.body = await this.parseBody(req);

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

  protected getValidUserSessionByToken(token: string) {
    return getRepository(Session).findOneOrFail(
      {
        token,
        expiryTimestamp: MoreThan(new Date().getTime() / 1000),
      },
      { relations: ['user'] },
    );
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
