import { MoreThan, Repository, getRepository } from 'typeorm';
import { Router } from '../router';
import { Session } from '../entity/Session';
import { getTokenFromCookie } from './utils/utils';
import { User } from '../entity/User';
import { IncomingMessage, ServerResponse } from 'http';
import urlParser from 'url';


abstract class BaseController<
  Entity,
  RepositoryType extends Repository<Entity>,
> {
  protected path: string = '/';
  public router: Router = new Router(urlParser);
  public repository: RepositoryType;

  constructor() {
    // bind index to this
    this.bindMethodsToThis();
  }

  public initializeRoutes(path: string): void {
    this.path = path;

    if (this.path !== '/signup' && this.path !== '/login') {
      this.router.get(this.path, this.index);
      this.router.get(`${this.path}/:id`, this.show);
      this.router.put(`${this.path}/:id`, this.update);
      this.router.delete(`${this.path}/:id`, this.delete);
    }
    if (!this.path.includes('/users')) this.router.post(this.path, this.create);
  }

  public async index(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const entities = await this.repository.find();

      res.end(JSON.stringify(entities));
    } catch (err) {
      this.handleErrors(err, res);
      return;
    }
  }

  public async show(req: IncomingMessage, res: ServerResponse): Promise<void> {
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
      this.handleErrors(err, res);
      return;
    }
  }

  public async create(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      let body = await this.parseBody(req);

      const entity = await this.repository.save(body);
      res.statusCode = 201;
      res.end(JSON.stringify(entity));
    } catch (err) {
      this.handleErrors(err, res);
      return;
    }
  }

  public async update(req: IncomingMessage, res: ServerResponse): Promise<void> {
    let session: Session;

    session = await this.validateUserSession(req, res);

    try {
      let body = await this.parseBody(req);
      const updatedEntity = await this.repository.update(
        session.user.id,
        body,
      );
      res.statusCode = 200;
      res.end(JSON.stringify(updatedEntity));
    } catch (err) {
      this.handleErrors(err, res);
      return;
    }
  }

  public async delete(req: IncomingMessage, res: ServerResponse): Promise<void> {
    let session: Session;

    session = await this.validateUserSession(req, res);

    try {
      const deletedEntity = await this.repository.delete(session.user.id);
      res.statusCode = 200;
      res.end(JSON.stringify(deletedEntity));
    } catch (err) {
      this.handleErrors(err, res);
      return;
    }
  }

  protected async validateUserSession(req: IncomingMessage, res: ServerResponse): Promise<Session> {
    let session: Session;

    let token: string | Error;

    try {
      token = getTokenFromCookie(req.headers.cookie);
    } catch (err) {
      this.handleErrors(err, res);
      return;
    }

    try {
      session = await this.getValidUserSessionByToken(token as string);
    } catch (err) {
      this.handleErrors(err, res);
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

  private getValidUserSessionByToken(token: string): Promise<Session> {
    return getRepository(Session).findOneOrFail(
      {
        token,
        expiryTimestamp: MoreThan(new Date().getTime() / 1000),
      },
      { relations: ['user'] },
    );
  }

  protected handleErrors(err: any, res: ServerResponse): void {
    res.statusCode = err.status || 500;
    res.end(err.message);
    return;
  }
  protected parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve(parsedBody);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  private bindMethodsToThis(): void {
    const methods = [
      'index',
      'create',
      'update',
      'delete',
      'show',
      'handleErrors',
      'validateUserSession',
      'getValidUserSessionByToken',
    ];
    methods.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }
}
export default BaseController;
