import { deriveKey, encryptPassword, generateKey } from '../../src/shared/crypto';
import {
  DuplicateError,
  LockedError,
  WrongPasswordError,
  createSettingsStore,
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

describe('settings store', () => {
  it('returns defaults and persists changes', async () => {
    const area = memoryArea();
    const settings = createSettingsStore(area);
    expect(await settings.get()).toEqual({ theme: 'default', notifications: false });
    await settings.set({ notifications: true });
    expect(await settings.get()).toEqual({ theme: 'default', notifications: true });
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
