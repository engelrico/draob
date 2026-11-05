// The only module that touches chrome.storage (ADR-0001, ADR-0002): vault and settings.
//
// chrome.storage.local["vault"] (schema v2):
//   { v: 2, kdf: { salt, iterations }, verifier: {iv,data}, data: {iv,data} }
//   data = AES-GCM(JSON { entries: Entry[] }); nothing readable (titles, urls, tags, passwords) outside it.
//   Entry = { id, title, url, password, tags: string[], favorite, createdAt, updatedAt }
// Schema v1 (plain titles/urls, per-entry encrypted passwords) is migrated on unlock; a copy is kept
// under "vaultBackupV1" until the next successful unlock of a v2 vault.
// The derived key lives only in chrome.storage.session ("sessionKey", JWK), gone when the browser closes.
import {
  DEFAULT_ITERATIONS,
  decryptPassword,
  deriveKey,
  encryptPassword,
  exportKey,
  importKey,
  randomBytes,
} from './crypto';
import { normalizeTags } from './entries';
import { findEntryByUrl, isBoardUrl } from './miro';

const VAULT = 'vault';
const BACKUP_V1 = 'vaultBackupV1';
const SESSION_KEY = 'sessionKey';
// LEGACY, NEVER CHANGE: the project was called MiroHero before draob. This string is stored encrypted
// in every existing vault and is checked on unlock; changing it would lock out all users.
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

/** Thrown when a Miro board already has an entry; `existingId` points at it. */
export class DuplicateError extends Error {
  constructor(existingId) {
    super('Für dieses Board gibt es schon einen Eintrag');
    this.name = 'DuplicateError';
    this.existingId = existingId;
  }
}

const publicEntry = ({ password: _password, ...rest }) => rest; // eslint-disable-line no-unused-vars

/**
 * @param {{local: chrome.storage.StorageArea, session: chrome.storage.StorageArea}} areas
 * @param {{iterations?: number}} [options] iterations is overridable for tests only.
 */
export function createVaultStore(areas, { iterations = DEFAULT_ITERATIONS } = {}) {
  const readVault = async () => (await areas.local.get(VAULT))[VAULT] || null;
  const writeVault = (vault) => areas.local.set({ [VAULT]: vault });
  const sealEntries = (entries, key) => encryptPassword(JSON.stringify({ entries }), key);

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

  /** Loads and decrypts all entries (needs the session key). */
  async function load() {
    const key = await requireKey();
    const vault = await readVault();
    const { entries } = JSON.parse(await decryptPassword(vault.data, key));
    return { key, vault, entries };
  }

  const save = async ({ key, vault }, entries) =>
    writeVault({ ...vault, data: await sealEntries(entries, key) });

  async function migrateV1(vault, key) {
    const now = Date.now();
    // Decrypt everything first: if anything fails, nothing has been written yet.
    const entries = await Promise.all(
      vault.entries.map(async ({ id, title, url, password }) => ({
        id,
        title,
        url,
        password: await decryptPassword(password, key),
        tags: [],
        favorite: false,
        createdAt: now,
        updatedAt: now,
      })),
    );
    await areas.local.set({ [BACKUP_V1]: vault });
    await writeVault({
      v: 2,
      kdf: vault.kdf,
      verifier: vault.verifier,
      data: await sealEntries(entries, key),
    });
  }

  function checkDuplicate(entries, url, selfId) {
    if (!isBoardUrl(url)) return;
    const other = findEntryByUrl(
      entries.filter((e) => e.id !== selfId),
      url,
    );
    if (other) throw new DuplicateError(other.id);
  }

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
        v: 2,
        kdf: { salt, iterations },
        verifier: await encryptPassword(VERIFIER_TEXT, key),
        data: await sealEntries([], key),
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
      if (vault.v === 1) await migrateV1(vault, key);
      else await areas.local.remove(BACKUP_V1);
      await startSession(key);
    },

    lock: () => areas.session.remove(SESSION_KEY),

    /** All entries without passwords. */
    async list() {
      return (await load()).entries.map(publicEntry);
    },

    async add({ title, url, password, tags = [], favorite = false }) {
      const ctx = await load();
      checkDuplicate(ctx.entries, url);
      const now = Date.now();
      const entry = {
        id: globalThis.crypto.randomUUID(),
        title,
        url,
        password,
        tags: normalizeTags(tags),
        favorite: Boolean(favorite),
        createdAt: now,
        updatedAt: now,
      };
      await save(ctx, [...ctx.entries, entry]);
      return entry.id;
    },

    /** Partial update: only the given fields change. */
    async update(id, fields) {
      const ctx = await load();
      const current = ctx.entries.find((e) => e.id === id);
      if (!current) throw new Error('Eintrag nicht gefunden');
      const next = { ...current, ...fields, id, updatedAt: Date.now() };
      next.tags = normalizeTags(next.tags);
      next.favorite = Boolean(next.favorite);
      checkDuplicate(ctx.entries, next.url, id);
      await save(
        ctx,
        ctx.entries.map((e) => (e.id === id ? next : e)),
      );
    },

    setFavorite(id, favorite) {
      return this.update(id, { favorite });
    },

    async reveal(id) {
      const entry = (await load()).entries.find((e) => e.id === id);
      if (!entry) throw new Error('Eintrag nicht gefunden');
      const { title, url, password, tags, favorite } = entry;
      return { title, url, password, tags, favorite };
    },

    async remove(id) {
      const ctx = await load();
      await save(
        ctx,
        ctx.entries.filter((e) => e.id !== id),
      );
    },

    /** Keeps `keepId`, folds tags/favorite of the others into it and deletes them. */
    async mergeDuplicates(keepId, removeIds) {
      const ctx = await load();
      const keep = ctx.entries.find((e) => e.id === keepId);
      if (!keep) throw new Error('Eintrag nicht gefunden');
      const gone = ctx.entries.filter((e) => removeIds.includes(e.id) && e.id !== keepId);
      const merged = {
        ...keep,
        tags: normalizeTags([...keep.tags, ...gone.flatMap((e) => e.tags)]),
        favorite: keep.favorite || gone.some((e) => e.favorite),
        updatedAt: Date.now(),
      };
      await save(
        ctx,
        ctx.entries.filter((e) => !gone.includes(e)).map((e) => (e.id === keepId ? merged : e)),
      );
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
