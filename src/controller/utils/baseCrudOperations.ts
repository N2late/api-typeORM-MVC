import { IncomingMessage, ServerResponse } from 'http';
import ErrorHandler from '../../errorHandling';
import ParamsBag from '../../paramsBag';
import { Session, User } from '../../entity';
import { Repository } from 'typeorm';
import authorization from '../../authorization/authorization';

export type HttpRequest = IncomingMessage & { body: any };

export class BaseCrudOperations {
  constructor(
    private readonly repository: Repository<any>,
    private readonly path: string,
  ) {}

  public async index(req: HttpRequest, res: ServerResponse): Promise<void> {
    try {
      const entities = await this.repository.find();

      res.end(JSON.stringify(entities));
    } catch (err) {
      ErrorHandler.handle(err, res);
      return;
    }
  }

  public async show(req: HttpRequest, res: ServerResponse): Promise<void> {
    const id = ParamsBag.getIdFromUrl(req);

    let session: Session;
    session = await authorization.validateUserSession(
      req,
      res,
      `${this.path}/${id}`,
    );

    if (!session) {
      return;
    }

    try {
      const entity = await this.repository.findOneOrFail(id);
      if (entity instanceof User) {
        delete entity.passwordHash;
      }
      res.end(JSON.stringify(entity));
    } catch (err) {
      ErrorHandler.handle(err, res);
      return;
    }
  }

  public async create(req: HttpRequest, res: ServerResponse): Promise<void> {
    try {
      req.body = await ParamsBag.parseRequestBody(req);

      await authorization.validateUserIdInSession(req, res, this.path);

      const entity = await this.repository.save(req.body);
      res.statusCode = 201;
      res.end(JSON.stringify(entity));
    } catch (err) {
      ErrorHandler.handle(err, res);
      return;
    }
  }

  public async update(req: HttpRequest, res: ServerResponse): Promise<void> {
    try {
      const id = ParamsBag.getIdFromUrl(req);
      req.body = await ParamsBag.parseRequestBody(req);

      await authorization.validateUserIdInSession(req, res, this.path);

      const updateInfo = req.body.updateInfo;
      const updatedEntity = await this.repository.update(id, updateInfo);
      res.statusCode = 200;
      res.end(JSON.stringify(updatedEntity));
    } catch (err) {
      ErrorHandler.handle(err, res);
      return;
    }
  }

  public async delete(req: HttpRequest, res: ServerResponse): Promise<void> {
    const id = ParamsBag.getIdFromUrl(req);
    req.body = await ParamsBag.parseRequestBody(req);
    try {
      await authorization.validateUserIdInSession(req, res, this.path);
      const deletedEntity = await this.repository.delete(id);
      res.statusCode = 200;
      res.end(JSON.stringify(deletedEntity));
    } catch (err) {
      ErrorHandler.handle(err, res);
      return;
    }
  }
}
