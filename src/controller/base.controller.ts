import { Repository } from 'typeorm';
import { Router } from '../router';
import { IncomingMessage, ServerResponse } from 'http';
import urlParser from 'url';


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

  public index(req: IncomingMessage, res: ServerResponse): Promise<void> {
    throw new Error('Bad request');
  }

  public show(req: IncomingMessage, res: ServerResponse): Promise<void> {
    throw new Error('Bad request');
  }

  public create(req: IncomingMessage, res: ServerResponse): Promise<void> {
    throw new Error('Bad request');
  }

  public update(req: IncomingMessage, res: ServerResponse): Promise<void> {
    throw new Error('Bad request');
  }

  public delete(req: IncomingMessage, res: ServerResponse): Promise<void> {
    throw new Error('Bad request');
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

  private bindMethodsToThis(): void {
    const methods = ['index', 'create', 'update', 'delete', 'show'];
    methods.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

}
export default BaseController;
