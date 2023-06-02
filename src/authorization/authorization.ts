import { IncomingMessage, ServerResponse } from 'http';
import { MoreThan, getRepository } from 'typeorm';
import { Session } from '../entity';
import ErrorHandler from '../errorHandling';

// Set up a session
class Authorization {

  public async validateUserIdInSession(
    req: any,
    res: any,
    path: string,
  ): Promise<Session>  {
    const userSession = await this.validateUserSession(req, res, path);

    if (userSession.user.id !== +req.body.userId) {
      ErrorHandler.unauthorized(res, 'Unauthorized');
      return;
    }

    return userSession;
  }
  public async validateUserSession(
    req: IncomingMessage,
    res: ServerResponse,
    path: string,
  ): Promise<Session> {
    let token: string;
    let session: Session;

    try {
      token = this.getTokenFromCookie(req.headers.cookie);
      session = await this.getValidUserSessionByToken(token);
      this.validateUserSessionPath(session, path);
      return session;
    } catch (err) {
      throw new Error('Unauthorized');
    }
  }

  private getTokenFromCookie(cookie: string): string {
    if (!cookie) {
      throw new Error('Session token not found');
    }
    const token = cookie.split('=')[1];
    const decodedToken = decodeURIComponent(token);
    return decodedToken;
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

  private validateUserSessionPath(session: Session, path: string): void {
    if (path.includes('/users')) {
      const [, , userId] = path.split('/');
      if (session.user.id !== +userId) {
        throw new Error('Unauthorized');
      }
    }
  }
}

export default new Authorization();
