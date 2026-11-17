import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/lib/password';

describe('password hashing (bcrypt cost 12)', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('sevyo123');
    expect(hash).not.toBe('sevyo123');
    expect(hash.startsWith('$2')).toBe(true);
    await expect(verifyPassword('sevyo123', hash)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct-horse');
    await expect(verifyPassword('wrong-battery', hash)).resolves.toBe(false);
  });

  it('produces unique hashes for the same input', async () => {
    const [a, b] = await Promise.all([
      hashPassword('same-input'),
      hashPassword('same-input'),
    ]);
    expect(a).not.toEqual(b);
  });
});