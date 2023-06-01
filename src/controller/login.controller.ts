import { ObjectType, Repository, getRepository } from 'typeorm';
import { User } from '../entity/User';
import BaseController from './base.controller';
import { Session } from '../entity/Session';
import { createSerializedSignupTokenCookie } from '../entity/utils/cookies';
import ValidationService from './utils/validationService';
import ErrorHandler from '../ErrorHandling';

class LoginController extends BaseController<User, Repository<User>> {
  constructor(User: ObjectType<User>) {
    const repository = getRepository(User);
    super(repository);
    this.initializeRoutes('/login');
  }

  public async create(req: any, res: any) {
    req.body = await this.parseBody(req);
    const { email, passwordHash } = req.body;

    try {
      ValidationService.checkInputIsNotEmpty(email);
      ValidationService.checkInputIsNotEmpty(passwordHash);
    } catch (err) {
      ErrorHandler.badRequest(res, err.message);
      return;
    }

    try {
      const userMatched = await getRepository(User).findOneOrFail({ email });
      const isPasswordHashValid = await userMatched.comparePassword(
        passwordHash,
      );
      if (!isPasswordHashValid) {
        ErrorHandler.badRequest(res, 'Invalid password');
        return;
      }

      const session = await getRepository(Session).save({
        user: userMatched,
      });

      delete userMatched.passwordHash;

      const serializedCookie = createSerializedSignupTokenCookie(session.token);

      res.statusCode = 200;
      res.setHeader('Set-Cookie', serializedCookie);
      res.end(JSON.stringify({ userMatched }));
    } catch (err) {
      ErrorHandler.handle(err, res);
    }
  }
}

export default LoginController;
