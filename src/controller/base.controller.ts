import { Repository } from 'typeorm';
import { Router } from '../router';
import { Session } from '../entity/Session';
import { User } from '../entity/User';
import { IncomingMessage, ServerResponse } from 'http';
import urlParser from 'url';
import Authorization from '../authorization/authorization';
import ErrorHandler from '../errorHandling';
import ParamsBag from '../paramsBag';

abstract class BaseController<
  Entity,
  RepositoryType extends Repository<Entity>,
> {
  protected path: string = '/';
  public router: Router = new Router(urlParser);
  public repository: RepositoryType;

  constructor(repository: RepositoryType) {
    this.repository = repository;
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
      ErrorHandler.handle(err, res);
      return;
    }
  }

  public async show(req: IncomingMessage, res: ServerResponse): Promise<void> {
    let session: Session;

    session = await Authorization.validateUserSession(req, res, this.path);

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
      Error;
      return;
    }
  }

  public async create(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    try {
      let body = await ParamsBag.parseRequestBody(req);

      const entity = await this.repository.save(body);
      res.statusCode = 201;
      res.end(JSON.stringify(entity));
    } catch (err) {
      Error;
      return;
    }
  }

  public async update(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    let session: Session;

    session = await Authorization.validateUserSession(req, res, this.path);

    try {
      let body = await ParamsBag.parseRequestBody(req);
      const updatedEntity = await this.repository.update(session.user.id, body);
      res.statusCode = 200;
      res.end(JSON.stringify(updatedEntity));
    } catch (err) {
      Error;
      return;
    }
  }

  public async delete(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    let session: Session;

    session = await Authorization.validateUserSession(req, res, this.path);

    try {
      const deletedEntity = await this.repository.delete(session.user.id);
      res.statusCode = 200;
      res.end(JSON.stringify(deletedEntity));
    } catch (err) {
      Error;
      return;
    }
  }

  private bindMethodsToThis(): void {
    const methods = ['index', 'create', 'update', 'delete', 'show'];
    methods.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  protected sendResponse(
    res: any,
    statusCode: number,
    body: any,
    serializedCookie: string = '',
  ) {
    if (serializedCookie) {
    res.statusCode = statusCode;
    res.setHeader('Set-Cookie', serializedCookie);
    res.end(JSON.stringify(body));
    } else {
      res.statusCode = statusCode;
      res.end(JSON.stringify(body));
    }
  }
}
export default BaseController;
