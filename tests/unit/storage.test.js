import { decryptPassword, deriveKey, encryptPassword, generateKey } from '../../src/shared/crypto';
import {
  DuplicateError,
  LockedError,
  WrongPasswordError,
  ImportError,
  validateExport,
  createVaultStore,
} from '../../src/shared/storage';

const memoryArea = () => {
  const data = {};
  return {
    data,
    get: async (key) => (key in data ? { [key]: structuredClone(data[key]) } : {}),
    set: async (items) => Object.assign(data, structuredClone(items)),
    remove: async (key) => delete data[key],
  };
};

const setup = () => {
  const areas = { local: memoryArea(), session: memoryArea() };
  return { areas, store: createVaultStore(areas, { iterations: 1000 }) };
};

const board = (n) => `https://miro.com/app/board/board${n}=/`;

describe('vault store', () => {
  it('walks through uninitialized -> unlocked -> locked -> unlocked', async () => {
    const { store } = setup();
    expect(await store.status()).toBe('uninitialized');
    await store.create('master-password');
    expect(await store.status()).toBe('unlocked');
    await store.lock();
    expect(await store.status()).toBe('locked');
    await store.unlock('master-password');
    expect(await store.status()).toBe('unlocked');
  });

  it('rejects a short master password and a second vault', async () => {
    const { store } = setup();
    await expect(store.create('short')).rejects.toThrow();
    await store.create('master-password');
    await expect(store.create('another-password')).rejects.toThrow();
  });

  it('rejects a wrong master password', async () => {
    const { store } = setup();
    await store.create('master-password');
    await store.lock();
    await expect(store.unlock('wrong-password')).rejects.toBeInstanceOf(WrongPasswordError);
    expect(await store.status()).toBe('locked');
  });

  it('stores nothing readable and reveals data after re-unlock', async () => {
    const { store, areas } = setup();
    await store.create('master-password');
    const id = await store.add({
      title: 'Kundenboard',
      url: 'https://example.com/x',
      password: 'geheim',
      tags: ['Kunde A'],
    });

    const raw = JSON.stringify(areas.local.data);
    for (const secret of ['geheim', 'Kundenboard', 'example.com', 'Kunde A']) {
      expect(raw).not.toContain(secret);
    }
    expect(await store.list()).toEqual([
      expect.objectContaining({ id, title: 'Kundenboard', tags: ['Kunde A'], favorite: false }),
    ]);
    expect((await store.list())[0]).not.toHaveProperty('password');

    await store.lock();
    await store.unlock('master-password');
    expect(await store.reveal(id)).toMatchObject({ password: 'geheim', title: 'Kundenboard' });
  });

  it('refuses every data operation while locked', async () => {
    const { store } = setup();
    await store.create('master-password');
    const id = await store.add({ title: 't', url: 'u', password: 'p' });
    await store.lock();
    const entry = { title: 't', url: 'u', password: 'p' };
    await expect(store.list()).rejects.toBeInstanceOf(LockedError);
    await expect(store.reveal(id)).rejects.toBeInstanceOf(LockedError);
    await expect(store.add(entry)).rejects.toBeInstanceOf(LockedError);
    await expect(store.update(id, { title: 'x' })).rejects.toBeInstanceOf(LockedError);
    await expect(store.remove(id)).rejects.toBeInstanceOf(LockedError);
  });

  it('removes entries', async () => {
    const { store } = setup();
    await store.create('master-password');
    const id = await store.add({ title: 't', url: 'u', password: 'p' });
    await store.remove(id);
    expect(await store.list()).toEqual([]);
  });

  it('keeps the derived key out of local storage', async () => {
    const { store, areas } = setup();
    await store.create('master-password');
    expect(Object.keys(areas.local.data)).toEqual(['vault']);
    expect(Object.keys(areas.session.data)).toEqual(['sessionKey']);
  });
});

describe('vault update', () => {
  it('changes only the given fields and re-encrypts', async () => {
    const { store, areas } = setup();
    await store.create('master-password');
    const id = await store.add({ title: 'Alt', url: 'u', password: 'altes-pw', tags: ['a'] });
    await store.update(id, { title: 'Neu', password: 'neues-pw' });
    expect(await store.reveal(id)).toMatchObject({
      title: 'Neu',
      url: 'u',
      password: 'neues-pw',
      tags: ['a'],
    });
    expect(JSON.stringify(areas.local.data)).not.toContain('neues-pw');
  });

  it('normalizes tags and toggles favorites', async () => {
    const { store } = setup();
    await store.create('master-password');
    const id = await store.add({
      title: 't',
      url: 'u',
      password: 'p',
      tags: [' Kunde  A ', 'kunde a', ''],
    });
    expect((await store.reveal(id)).tags).toEqual(['Kunde A']);
    await store.setFavorite(id, true);
    expect((await store.reveal(id)).favorite).toBe(true);
  });

  it('rejects unknown ids', async () => {
    const { store } = setup();
    await store.create('master-password');
    await expect(store.update('nope', { title: 't' })).rejects.toThrow();
  });
});

describe('duplicates', () => {
  it('rejects a second entry for the same board id but allows other urls', async () => {
    const { store } = setup();
    await store.create('master-password');
    const id = await store.add({ title: 'A', url: board(1), password: 'p' });
    await expect(
      store.add({ title: 'B', url: `https://eu.miro.com/app/board/board1=/?x=1`, password: 'p' }),
    ).rejects.toMatchObject({ name: 'DuplicateError', existingId: id });
    await store.add({ title: 'C', url: 'https://example.com/a', password: 'p' });
    await store.add({ title: 'D', url: 'https://example.com/a', password: 'p' }); // not a board
    expect(await store.list()).toHaveLength(3);
  });

  it('rejects updating an entry onto another entrys board, but not onto itself', async () => {
    const { store } = setup();
    await store.create('master-password');
    const a = await store.add({ title: 'A', url: board(1), password: 'p' });
    const b = await store.add({ title: 'B', url: board(2), password: 'p' });
    await expect(store.update(b, { url: board(1) })).rejects.toBeInstanceOf(DuplicateError);
    await expect(store.update(a, { title: 'A2' })).resolves.toBeUndefined();
  });

  it('merges entries, unioning tags and favorites', async () => {
    const { store, areas } = setup();
    await store.create('master-password');
    const a = await store.add({ title: 'A', url: board(1), password: 'pa', tags: ['x'] });
    const b = await store.add({ title: 'B', url: board(2), password: 'pb', tags: ['y'] });
    await store.mergeDuplicates(a, [b]);
    expect(await store.list()).toEqual([expect.objectContaining({ id: a, tags: ['x', 'y'] })]);
    expect(Object.keys(areas.local.data)).toEqual(['vault']);
  });
});

describe('migration v1 -> v2', () => {
  const buildV1 = async (areas, { corrupt = false } = {}) => {
    const salt = Array(16).fill(3);
    const key = await deriveKey('master-password', salt, 1000);
    const ok = await encryptPassword('pw-eins', key);
    const vault = {
      v: 1,
      kdf: { salt, iterations: 1000 },
      // legacy verifier text from the MiroHero days; must keep unlocking old vaults
      verifier: await encryptPassword('mirohero-verifier-v1', key),
      entries: [
        { id: 'e1', title: 'Altes Board', url: board(1), password: ok },
        {
          id: 'e2',
          title: 'Zweites',
          url: board(2),
          password: corrupt ? await encryptPassword('x', await generateKey()) : ok,
        },
      ],
    };
    areas.local.data.vault = vault;
    return vault;
  };

  it('upgrades on unlock, hides metadata, keeps passwords and a backup', async () => {
    const { store, areas } = setup();
    const v1 = await buildV1(areas);
    await store.unlock('master-password');

    const vault = areas.local.data.vault;
    expect(vault.v).toBe(2);
    expect(vault).not.toHaveProperty('entries');
    expect(JSON.stringify(vault)).not.toContain('Altes Board');
    expect(areas.local.data.vaultBackupV1).toEqual(v1);

    expect(await store.list()).toEqual([
      expect.objectContaining({ id: 'e1', title: 'Altes Board', tags: [], favorite: false }),
      expect.objectContaining({ id: 'e2', title: 'Zweites' }),
    ]);
    expect((await store.reveal('e1')).password).toBe('pw-eins');
  });

  it('drops the backup on the next successful unlock', async () => {
    const { store, areas } = setup();
    await buildV1(areas);
    await store.unlock('master-password');
    await store.lock();
    await store.unlock('master-password');
    expect(areas.local.data).not.toHaveProperty('vaultBackupV1');
    expect(await store.list()).toHaveLength(2);
  });

  it('leaves v1 untouched and stays locked if an entry cannot be decrypted', async () => {
    const { store, areas } = setup();
    const v1 = await buildV1(areas, { corrupt: true });
    await expect(store.unlock('master-password')).rejects.toBeDefined();
    expect(areas.local.data.vault).toEqual(v1);
    expect(areas.local.data).not.toHaveProperty('vaultBackupV1');
    expect(await store.status()).toBe('locked');
  });
});

describe('legacy verifier', () => {
  it('keeps the pre-rename verifier text so existing vaults still unlock', async () => {
    const { store, areas } = setup();
    await store.create('master-password');
    const { kdf, verifier } = areas.local.data.vault;
    const key = await deriveKey('master-password', kdf.salt, kdf.iterations);
    expect(await decryptPassword(verifier, key)).toBe('mirohero-verifier-v1');
  });
});

describe('export, import and reset', () => {
  const fresh = async () => {
    const ctx = setup();
    await ctx.store.create('master-password');
    const id = await ctx.store.add({
      title: 'Board A',
      url: board(1),
      password: 'pw-a',
      tags: ['x'],
    });
    return { ...ctx, id };
  };

  it('exports only encrypted data, even while locked', async () => {
    const { store, areas } = await fresh();
    await store.lock();
    const file = await store.exportVault();
    expect(file).toMatchObject({ app: 'draob', exportVersion: 1 });
    expect(file.vault).toEqual(areas.local.data.vault);
    const raw = JSON.stringify(file);
    for (const secret of ['Board A', 'pw-a', 'miro.com']) expect(raw).not.toContain(secret);
  });

  it('round-trips into an empty profile and unlocks with the original password', async () => {
    const { store: source, id } = await fresh();
    const file = JSON.parse(JSON.stringify(await source.exportVault()));

    const { store: target, areas } = setup();
    await target.importVault(file);
    expect(await target.status()).toBe('locked');
    await expect(target.unlock('wrong-password')).rejects.toBeInstanceOf(WrongPasswordError);
    await target.unlock('master-password');
    expect(await target.reveal(id)).toMatchObject({ title: 'Board A', password: 'pw-a' });
    expect(areas.local.data).not.toHaveProperty('vaultBackupPreImport');
  });

  it('keeps the previous vault as backup, locks the session and replaces the data', async () => {
    const { store: source } = await fresh();
    const file = await source.exportVault();

    const { store: target, areas } = setup();
    await target.create('another-password');
    await target.add({ title: 'Old', url: board(9), password: 'old' });
    const before = structuredClone(areas.local.data.vault);

    await target.importVault(file);
    expect(areas.local.data.vaultBackupPreImport).toEqual(before);
    expect(areas.session.data).not.toHaveProperty('sessionKey');
    expect(await target.status()).toBe('locked');
  });

  it('rejects foreign, malformed and tampered files without touching the vault', async () => {
    const { store, areas } = await fresh();
    const good = await store.exportVault();
    const before = structuredClone(areas.local.data.vault);
    const bad = [
      null,
      {},
      { app: 'other', exportVersion: 1, vault: good.vault },
      { ...good, exportVersion: 2 },
      { ...good, vault: { ...good.vault, v: 1 } },
      { ...good, vault: { ...good.vault, kdf: { ...good.vault.kdf, iterations: 1e12 } } },
      { ...good, vault: { ...good.vault, kdf: { salt: [1, 2], iterations: 1000 } } },
      { ...good, vault: { ...good.vault, data: { iv: [1, 2, 3], data: [1] } } },
      { ...good, vault: { ...good.vault, verifier: { iv: good.vault.verifier.iv, data: ['x'] } } },
    ];
    for (const file of bad) {
      await expect(store.importVault(file)).rejects.toBeInstanceOf(ImportError);
    }
    expect(areas.local.data.vault).toEqual(before);
    expect(areas.local.data).not.toHaveProperty('vaultBackupPreImport');
    expect(() => validateExport(good)).not.toThrow();
  });

  it('refuses to export a v1 vault that was not migrated yet', async () => {
    const { store, areas } = setup();
    areas.local.data.vault = {
      v: 1,
      kdf: { salt: Array(16).fill(1), iterations: 1000 },
      verifier: {},
      entries: [],
    };
    await expect(store.exportVault()).rejects.toThrow();
  });

  it('reset wipes the vault, every backup and the session key', async () => {
    const { store, areas } = await fresh();
    areas.local.data.vaultBackupV1 = { v: 1 };
    areas.local.data.vaultBackupPreImport = { v: 2 };
    await store.reset();
    expect(areas.local.data).toEqual({});
    expect(areas.session.data).toEqual({});
    expect(await store.status()).toBe('uninitialized');
  });
});
