import { LessThan, ObjectType, Repository, getRepository } from 'typeorm';
import BaseController from './base.controller';
import { Session } from '../entity/Session';
import { User } from '../entity/User';
import ValidationService from './utils/validationService';
import { createSerializedSignupTokenCookie } from '../entity/utils/cookies';
import ErrorHandler from '../errorHandling';
import ParamsBag from '../paramsBag';
import { IncomingMessage, ServerResponse } from 'http';

export class SignupController extends BaseController<
  Session,
  Repository<Session>
> {
  private userRepository: Repository<User>;

  constructor(Session: ObjectType<Session>) {
    const repository = getRepository(Session);
    super(repository);
    this.userRepository = getRepository(User);
    this.initializeRoutes('/signup');
  }

  public async create(req: IncomingMessage, res: ServerResponse) {
    const body = await ParamsBag.parseRequestBody(req);
    const { firstName, lastName, email, passwordHash } = body;

    try {
      await ValidationService.checkIfUserExists(email);
    } catch (err) {
      ErrorHandler.badRequest(res, err.message);
      return;
    }

    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.passwordHash = passwordHash;

    try {
      await ValidationService.validateEntity(user);
      await user.hashPassword(passwordHash);
      const newUser = await this.userRepository.save(user);

      const session = await this.repository.save({ user: newUser });
      await this.repository.delete({
        expiryTimestamp: LessThan(new Date().getTime() / 1000),
      });

      delete newUser.passwordHash;

      const serializedCookie = createSerializedSignupTokenCookie(session.token);

      this.sendResponse(res, 201, { user: newUser }, serializedCookie);
    } catch (err) {
      ErrorHandler.handle(err, res);
    }
  }
}

export default SignupController;
