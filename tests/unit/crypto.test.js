import { webcrypto } from 'node:crypto';
import { generateKey, encryptPassword, decryptPassword } from '../../src/shared/crypto';

beforeAll(() => {
  global.window = { crypto: webcrypto };
});

describe('crypto', () => {
  it('round-trips a password with the same key', async () => {
    const key = await generateKey();
    const encrypted = await encryptPassword('geheim', key);
    expect(encrypted.data).not.toEqual(Array.from(new TextEncoder().encode('geheim')));
    expect(await decryptPassword(encrypted, key)).toBe('geheim');
  });

  it('uses a fresh IV per encryption', async () => {
    const key = await generateKey();
    const a = await encryptPassword('x', key);
    const b = await encryptPassword('x', key);
    expect(a.iv).not.toEqual(b.iv);
  });

  it('fails to decrypt with a different key', async () => {
    const encrypted = await encryptPassword('geheim', await generateKey());
    await expect(decryptPassword(encrypted, await generateKey())).rejects.toBeDefined();
  });
});
