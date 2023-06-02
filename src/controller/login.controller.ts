import { ObjectType, Repository, getRepository } from 'typeorm';
import { User } from '../entity/User';
import BaseController from './base.controller';
import { Session } from '../entity/Session';
import { createSerializedSignupTokenCookie } from '../entity/utils/cookies';
import ValidationService from './utils/validationService';
import ErrorHandler from '../errorHandling';
import ParamsBag from '../paramsBag';
import { IncomingMessage, ServerResponse } from 'http';

class LoginController extends BaseController<User, Repository<User>> {
  constructor(User: ObjectType<User>) {
    const repository = getRepository(User);
    super(repository);
    this.initializeRoutes('/login');
  }

  public async create(req: IncomingMessage, res: ServerResponse) {
    try {
      const { email, passwordHash } = await ParamsBag.parseRequestBody(req);
      this.validateInputs(email, passwordHash);
      const userMatched = await this.findUserByEmail(email);
      await this.checkPassword(userMatched, passwordHash);
      delete userMatched.passwordHash;
      const session = await this.createSession(userMatched);
      const serializedCookie = createSerializedSignupTokenCookie(session.token);
      this.sendResponse(res, 200, { userMatched }, serializedCookie);
    } catch (err) {
      ErrorHandler.handle(err, res);
    }
  }

  private validateInputs(email: string, passwordHash: string) {
    ValidationService.checkInputIsNotEmpty(email);
    ValidationService.checkInputIsNotEmpty(passwordHash);
  }

  private async findUserByEmail(email: string) {
    const userMatched = await getRepository(User).findOneOrFail({ email });

    return userMatched;
  }

  private async checkPassword(userMatched: User, passwordHash: string) {
    const isPasswordHashValid = await userMatched.comparePassword(passwordHash);
    if (!isPasswordHashValid) {
      throw new Error('Invalid password');
    }
  }

  private async createSession(userMatched: User) {
    const session = await getRepository(Session).save({ user: userMatched });
    return session;
  }

  private sendResponse(
    res: any,
    statusCode: number,
    body: any,
    serializedCookie: string,
  ) {
    res.statusCode = statusCode;
    res.setHeader('Set-Cookie', serializedCookie);
    res.end(JSON.stringify(body));
  }
}

export default LoginController;
