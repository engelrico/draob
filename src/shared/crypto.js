// AES-GCM helpers plus PBKDF2 key derivation (ADR-0001).
// Uses globalThis.crypto (available in extension pages, service workers and Node >= 19).

const subtle = () => globalThis.crypto.subtle;

export const DEFAULT_ITERATIONS = 600000;

export function randomBytes(length) {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(length)));
}

/** Derive an extractable AES-GCM key from the master password. */
export async function deriveKey(masterPassword, salt, iterations = DEFAULT_ITERATIONS) {
  const material = await subtle().importKey(
    'raw',
    new TextEncoder().encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return subtle().deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(salt), iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
}

export const exportKey = (key) => subtle().exportKey('jwk', key);

export const importKey = (jwk) =>
  subtle().importKey('jwk', jwk, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);

export async function generateKey() {
  return subtle().generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function encryptPassword(plainText, key) {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await subtle().encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plainText),
  );
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
}

export async function decryptPassword(encryptedObj, key) {
  const decrypted = await subtle().decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(encryptedObj.iv) },
    key,
    new Uint8Array(encryptedObj.data),
  );
  return new TextDecoder().decode(decrypted);
}
