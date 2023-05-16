import * as cookie from 'cookie';

export function createSerializedSignupTokenCookie(token: string) {
  return cookie.serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    expires: new Date(Date.now() + 3600 * 1000),
    path: '/',
  });
}
