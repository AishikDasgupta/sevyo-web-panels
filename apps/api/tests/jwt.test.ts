import { describe, expect, it } from 'vitest';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/lib/jwt';

describe('jwt tokens', () => {
  const payload = { sub: '42', role: 'user' as const };

  it('round-trips an access token', () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('42');
    expect(decoded.role).toBe('user');
  });

  it('round-trips a refresh token', () => {
    const decoded = verifyRefreshToken(signRefreshToken({ sub: '7', role: 'vendor' }));
    expect(decoded.sub).toBe('7');
    expect(decoded.role).toBe('vendor');
  });

  it('does not accept a refresh token as an access token', () => {
    const refreshOnly = signRefreshToken({ sub: '1', role: 'admin' });
    expect(() => verifyAccessToken(refreshOnly)).toThrow();
  });

  it('rejects garbage tokens', () => {
    expect(() => verifyAccessToken('not.a.jwt')).toThrow();
  });
});
