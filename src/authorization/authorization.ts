import { IncomingMessage, ServerResponse } from 'http';
import { MoreThan, getRepository } from 'typeorm';
import { Session } from '../entity';

class Authorization {
  public async validateUserSession(
    req: IncomingMessage,
    res: ServerResponse,
    path: string,
  ): Promise<Session> {
    let session: Session;

    let token: string | Error;

    try {
      token = Authorization.getTokenFromCookie(req.headers.cookie);
    } catch (err) {
      Authorization.handleErrors(err, res);
      return;
    }

    try {
      session = await Authorization.getValidUserSessionByToken(token as string);
    } catch (err) {
      Authorization.handleErrors(err, res);
      return;
    }

    if (path.includes('/users')) {
      const [, , userId] = req.url.split('/');
      if (session.user.id !== +userId) {
        res.statusCode = 401;
        res.end(JSON.stringify('Unauthorized'));
        return;
      }
    }

    return session;
  }

  private static getValidUserSessionByToken(token: string): Promise<Session> {
    return getRepository(Session).findOneOrFail(
      {
        token,
        expiryTimestamp: MoreThan(new Date().getTime() / 1000),
      },
      { relations: ['user'] },
    );
  }

  private static handleErrors(err: any, res: ServerResponse): void {
    res.statusCode = err.status || 500;
    res.end(err.message);
  }

  private static getTokenFromCookie(cookie: string): string | Error {
    if (!cookie) {
      throw new Error('Session token not found');
    }
    const token = cookie.split('=')[1];
    const decodedToken = decodeURIComponent(token);
    return decodedToken;
  }
}

export default new Authorization();
