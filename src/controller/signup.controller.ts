import { LessThan, getRepository } from 'typeorm';
import BaseController from './base.controller';
import { Session } from '../entity/Session';
import { User } from '../entity/User';
import { checkIfUserExists, validateEntity } from './utils/utils';
import { createSerializedSignupTokenCookie } from '../entity/utils/cookies';

export class SignupController extends BaseController<Session> {
  constructor() {
    super();
    this.repository = getRepository(Session);
    this.initializeRoutes('/signup');
  }

  public async create(req: any, res: any) {
    let body = await this.parseBody(req);


    const { firstName, lastName, email, passwordHash } = body;

    // check if user already exists
    try {
      await checkIfUserExists(email);
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: err.message }));
      return;
    }

    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.passwordHash = passwordHash;

    try {
      await validateEntity(user);
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
      res.statusCode = 400;
      res.end(JSON.stringify({ message: err.message }));
    }
  }
}

export default SignupController;
