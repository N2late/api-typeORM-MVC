import * as cookie from 'cookie';

export function createSerializedSignupTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24; // 1 day
  return cookie.serialize('sessionToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: maxAge,
    expires: new Date(Date.now() + maxAge * 1000),
    path: '/',
  });
}
