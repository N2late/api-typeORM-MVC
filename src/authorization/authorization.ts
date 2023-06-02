import { IncomingMessage, ServerResponse } from 'http';
import { MoreThan, getRepository } from 'typeorm';
import { Session } from '../entity';
import ErrorHandler from '../errorHandling';

// Set up a session
class Authorization {
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
      ErrorHandler.unauthorized(res, err.message);
      return;
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
