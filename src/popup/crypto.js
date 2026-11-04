// AES-GCM encryption/decryption helpers for password storage
// Usage: await encryptPassword(plain, key), await decryptPassword(encrypted, key)

export async function generateKey() {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPassword(plainText, key) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  );
  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  };
}

export async function decryptPassword(encryptedObj, key) {
  const enc = new TextDecoder();
  const iv = new Uint8Array(encryptedObj.iv);
  const data = new Uint8Array(encryptedObj.data);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return enc.decode(decrypted);
}
