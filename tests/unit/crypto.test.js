import {
  decryptPassword,
  deriveKey,
  encryptPassword,
  exportKey,
  generateKey,
  importKey,
} from '../../src/shared/crypto';

const SALT = Array(16).fill(7);
const FAST = 1000; // iterations: low only for test speed

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

  it('derives the same key from the same password and salt', async () => {
    const encrypted = await encryptPassword('geheim', await deriveKey('master-pw', SALT, FAST));
    const again = await deriveKey('master-pw', SALT, FAST);
    expect(await decryptPassword(encrypted, again)).toBe('geheim');
  });

  it('derives a different key for a different password or salt', async () => {
    const encrypted = await encryptPassword('geheim', await deriveKey('master-pw', SALT, FAST));
    await expect(
      decryptPassword(encrypted, await deriveKey('other-pw', SALT, FAST)),
    ).rejects.toBeDefined();
    await expect(
      decryptPassword(encrypted, await deriveKey('master-pw', Array(16).fill(8), FAST)),
    ).rejects.toBeDefined();
  });

  it('survives a JWK export/import round trip', async () => {
    const key = await deriveKey('master-pw', SALT, FAST);
    const restored = await importKey(await exportKey(key));
    const encrypted = await encryptPassword('geheim', key);
    expect(await decryptPassword(encrypted, restored)).toBe('geheim');
  });
});
