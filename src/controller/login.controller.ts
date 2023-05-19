import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import BaseController from './base.controller';
import { Session } from '../entity/Session';
import { createSerializedSignupTokenCookie } from '../entity/utils/cookies';
import { checkInputIsNotEmpty } from './utils/utils';

class LoginController extends BaseController<User> {
  constructor() {
    super();
    this.initializeRoutes('/login');
  }

  public async create(req: any, res: any) {
    req.body = await this.parseBody(req);
    const {email, passwordHash } = req.body;

    try {
      checkInputIsNotEmpty(email);
      checkInputIsNotEmpty(passwordHash);

    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: err.message }));
      return;
    }

    try {
      const userMatched = await getRepository(User).findOneOrFail({ email });
      const isPasswordHashValid = await userMatched.comparePassword(passwordHash);
      if (!isPasswordHashValid) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Invalid credentials' }));
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
      res.statusCode = 400;
      res.end(JSON.stringify({ message: err.message }));
    }
  }
}

export default LoginController;
