import { LessThan, ObjectType, Repository, getRepository } from 'typeorm';
import BaseController from './base.controller';
import { Session } from '../entity/Session';
import { User } from '../entity/User';
import ValidationService from './utils/validationService';
import { createSerializedSignupTokenCookie } from '../entity/utils/cookies';
import ErrorHandler from '../ErrorHandling';

export class SignupController extends BaseController<Session, Repository<Session>> {
  constructor(Session: ObjectType<Session>) {
    const repository = getRepository(Session);
    super(repository);
    this.initializeRoutes('/signup');
  }

  public async create(req: any, res: any) {
    let body = await this.parseBody(req);


    const { firstName, lastName, email, passwordHash } = body;

    // check if user already exists
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
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: err.message }));
      return;
    }
    await user.hashPassword(passwordHash);

    try {
      const newUser = await getRepository(User).save(user);

      const session = await this.repository.save({
        user: newUser,
      });

      // delete expired sessions from db
      await this.repository.delete({
        expiryTimestamp: LessThan(new Date().getTime() / 1000),
      });

      delete newUser.passwordHash;

      const serializedCookie = createSerializedSignupTokenCookie(session.token);

      res.statusCode = 201;
      res.setHeader('Set-Cookie', serializedCookie);
      res.end(JSON.stringify({ user: newUser }));
    } catch (err) {
      ErrorHandler.handle(err, res);
    }
  }
}

export default SignupController;
