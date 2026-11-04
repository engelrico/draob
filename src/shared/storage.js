// The only module that touches chrome.storage (ADR-0001): vault and settings.
//
// Layout in chrome.storage.local, key "vault":
//   { v: 1, kdf: { salt: number[], iterations: number }, verifier: {iv,data}, entries: Entry[] }
//   Entry = { id, title, url, password: {iv,data} }
// The derived key lives only in chrome.storage.session (key "sessionKey", JWK) and is gone
// when the browser closes.
import {
  DEFAULT_ITERATIONS,
  decryptPassword,
  deriveKey,
  encryptPassword,
  exportKey,
  importKey,
  randomBytes,
} from './crypto';

const VAULT = 'vault';
const SESSION_KEY = 'sessionKey';
const VERIFIER_TEXT = 'mirohero-verifier-v1';
export const MIN_MASTER_LENGTH = 8;

export class WrongPasswordError extends Error {
  constructor() {
    super('Falsches Masterpasswort');
    this.name = 'WrongPasswordError';
  }
}

export class LockedError extends Error {
  constructor() {
    super('Tresor ist gesperrt');
    this.name = 'LockedError';
  }
}

/**
 * @param {{local: chrome.storage.StorageArea, session: chrome.storage.StorageArea}} areas
 * @param {{iterations?: number}} [options] iterations is overridable for tests only.
 */
export function createVaultStore(areas, { iterations = DEFAULT_ITERATIONS } = {}) {
  const readVault = async () => (await areas.local.get(VAULT))[VAULT] || null;
  const writeVault = (vault) => areas.local.set({ [VAULT]: vault });

  async function sessionKey() {
    const jwk = (await areas.session.get(SESSION_KEY))[SESSION_KEY];
    return jwk ? importKey(jwk) : null;
  }

  async function requireKey() {
    const key = await sessionKey();
    if (!key) throw new LockedError();
    return key;
  }

  const startSession = async (key) => areas.session.set({ [SESSION_KEY]: await exportKey(key) });

  return {
    async status() {
      if (!(await readVault())) return 'uninitialized';
      return (await sessionKey()) ? 'unlocked' : 'locked';
    },

    async create(masterPassword) {
      if (await readVault()) throw new Error('Tresor existiert bereits');
      if (!masterPassword || masterPassword.length < MIN_MASTER_LENGTH) {
        throw new Error(`Masterpasswort braucht mindestens ${MIN_MASTER_LENGTH} Zeichen`);
      }
      const salt = randomBytes(16);
      const key = await deriveKey(masterPassword, salt, iterations);
      await writeVault({
        v: 1,
        kdf: { salt, iterations },
        verifier: await encryptPassword(VERIFIER_TEXT, key),
        entries: [],
      });
      await startSession(key);
    },

    async unlock(masterPassword) {
      const vault = await readVault();
      if (!vault) throw new Error('Kein Tresor vorhanden');
      const key = await deriveKey(masterPassword, vault.kdf.salt, vault.kdf.iterations);
      try {
        if ((await decryptPassword(vault.verifier, key)) !== VERIFIER_TEXT) throw new Error();
      } catch {
        throw new WrongPasswordError();
      }
      await startSession(key);
    },

    lock: () => areas.session.remove(SESSION_KEY),

    /** Entries without passwords; list display needs no key. */
    async list() {
      const vault = await readVault();
      return (vault?.entries || []).map(({ id, title, url }) => ({ id, title, url }));
    },

    async add({ title, url, password }) {
      const key = await requireKey();
      const vault = await readVault();
      const entry = {
        id: globalThis.crypto.randomUUID(),
        title,
        url,
        password: await encryptPassword(password, key),
      };
      await writeVault({ ...vault, entries: [...vault.entries, entry] });
      return entry.id;
    },

    async reveal(id) {
      const key = await requireKey();
      const entry = (await readVault()).entries.find((e) => e.id === id);
      if (!entry) throw new Error('Eintrag nicht gefunden');
      return {
        title: entry.title,
        url: entry.url,
        password: await decryptPassword(entry.password, key),
      };
    },

    async remove(id) {
      await requireKey();
      const vault = await readVault();
      await writeVault({ ...vault, entries: vault.entries.filter((e) => e.id !== id) });
    },
  };
}

/** Production instance bound to the real chrome.storage areas. */
export const vaultStore = () =>
  createVaultStore({ local: chrome.storage.local, session: chrome.storage.session });

const SETTINGS = 'userOptions';
const DEFAULT_SETTINGS = { theme: 'default', notifications: false };

export function createSettingsStore(area) {
  return {
    async get() {
      return { ...DEFAULT_SETTINGS, ...((await area.get(SETTINGS))[SETTINGS] || {}) };
    },
    set: (settings) => area.set({ [SETTINGS]: { ...DEFAULT_SETTINGS, ...settings } }),
  };
}

export const settingsStore = () => createSettingsStore(chrome.storage.local);
