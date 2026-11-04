import {
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

  it('stores passwords encrypted and reveals them after re-unlock', async () => {
    const { store, areas } = setup();
    await store.create('master-password');
    const id = await store.add({
      title: 'Board',
      url: 'https://miro.com/app/board/1',
      password: 'geheim',
    });

    expect(JSON.stringify(areas.local.data)).not.toContain('geheim');
    expect(await store.list()).toEqual([
      { id, title: 'Board', url: 'https://miro.com/app/board/1' },
    ]);

    await store.lock();
    await store.unlock('master-password'); // simulates a new session with the same vault
    expect((await store.reveal(id)).password).toBe('geheim');
  });

  it('refuses secret operations while locked', async () => {
    const { store } = setup();
    await store.create('master-password');
    const id = await store.add({ title: 't', url: 'u', password: 'p' });
    await store.lock();
    await expect(store.reveal(id)).rejects.toBeInstanceOf(LockedError);
    await expect(store.add({ title: 't', url: 'u', password: 'p' })).rejects.toBeInstanceOf(
      LockedError,
    );
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
  it('replaces an entry in place and re-encrypts the password', async () => {
    const { store, areas } = setup();
    await store.create('master-password');
    const id = await store.add({ title: 'Alt', url: 'u', password: 'altes-pw' });
    await store.update(id, { title: 'Neu', url: 'u2', password: 'neues-pw' });
    expect(await store.list()).toEqual([{ id, title: 'Neu', url: 'u2' }]);
    expect((await store.reveal(id)).password).toBe('neues-pw');
    expect(JSON.stringify(areas.local.data)).not.toContain('neues-pw');
  });

  it('rejects unknown ids and locked state', async () => {
    const { store } = setup();
    await store.create('master-password');
    await expect(store.update('nope', { title: 't', url: 'u', password: 'p' })).rejects.toThrow();
    const id = await store.add({ title: 't', url: 'u', password: 'p' });
    await store.lock();
    await expect(store.update(id, { title: 't', url: 'u', password: 'p' })).rejects.toBeInstanceOf(
      LockedError,
    );
  });
});
