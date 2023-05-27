import { MoreThan, Repository, getRepository } from 'typeorm';
import { Router } from '../router';
import { Session } from '../entity/Session';
import { getTokenFromCookie } from './utils/utils';
import { User } from '../entity/User';
import { IncomingMessage } from 'http';
import urlParser from 'url';

abstract class BaseController<
  Entity,
  RepositoryType extends Repository<Entity>,
> {
  protected path = '/';
  public router = new Router(urlParser);
  public repository: RepositoryType;
  constructor() {
    // bind index to this
    this.index = this.index.bind(this);
    this.create = this.create.bind(this);
    this.parseBody = this.parseBody.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.show = this.show.bind(this);
    this.errorHandling = this.errorHandling.bind(this);
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
      this.errorHandling(err, res);
      return;
    }
  }

  public async show(req: any, res: any) {
    let session: Session;

    session = await this.validateUserSession(req, res);

    if (!session) {
      return;
    }

    try {
      const entity = await this.repository.findOne(session.user.id);
      if (entity instanceof User) {
        delete entity.passwordHash;
      }
      res.end(JSON.stringify(entity));
    } catch (err) {
      this.errorHandling(err, res);
      return;
    }
  }

  public async create(req: any, res: any) {
    try {
      req.body = await this.parseBody(req);

      const entity = await this.repository.save(req.body);
      res.statusCode = 201;
      res.end(JSON.stringify(entity));
    } catch (err) {
      this.errorHandling(err, res);
      return;
    }
  }

  public async update(req: any, res: any) {
    let session: Session;

    session = await this.validateUserSession(req, res);

    try {
      req.body = await this.parseBody(req);
      const updatedEntity = await this.repository.update(
        session.user.id,
        req.body,
      );
      res.statusCode = 200;
      res.end(JSON.stringify(updatedEntity));
    } catch (err) {
      this.errorHandling(err, res);
      return;
    }
  }

  public async delete(req: any, res: any) {
    let session: Session;

    session = await this.validateUserSession(req, res);

    try {
      const deletedEntity = await this.repository.delete(session.user.id);
      res.statusCode = 200;
      res.end(JSON.stringify(deletedEntity));
    } catch (err) {
      this.errorHandling(err, res);
      return;
    }
  }

  protected async validateUserSession(req: IncomingMessage, res: any) {
    let session: Session;

    let token: string | Error;

    try {
      token = getTokenFromCookie(req.headers.cookie);
    } catch (err) {
      this.errorHandling(err, res);
      return;
    }

    try {
      session = await this.getValidUserSessionByToken(token as string);
    } catch (err) {
      this.errorHandling(err, res);
      return;
    }

    if (this.path.includes('/users')) {
      const [, , userId] = req.url.split('/');
      if (session.user.id !== +userId) {
        res.statusCode = 401;
        res.end(JSON.stringify('Unauthorized'));
        return;
      }
    }

    return session;
  }

  private getValidUserSessionByToken(token: string) {
    return getRepository(Session).findOneOrFail(
      {
        token,
        expiryTimestamp: MoreThan(new Date().getTime() / 1000),
      },
      { relations: ['user'] },
    );
  }

  protected errorHandling(err: any, res: any) {
    res.statusCode = err.status || 500;
    res.end(err.message);
    return;
  }
  protected async parseBody(req: any) {
    req.body = '';
    await req.on('data', (chunk) => {
      req.body += chunk.toString();
    });

    return JSON.parse(req.body);
  }
}
export default BaseController;
