import { openInNewTab } from '../../src/shared/tabs';

afterEach(() => {
  delete globalThis.chrome;
});

const withChrome = (create) => {
  globalThis.chrome = { tabs: { create } };
  return create;
};

describe('openInNewTab', () => {
  it('opens a foreground tab for a valid address', async () => {
    const create = withChrome(jest.fn().mockResolvedValue({}));
    await expect(openInNewTab('miro.com/app/board/x=/')).resolves.toBe(true);
    expect(create).toHaveBeenCalledWith({ url: 'https://miro.com/app/board/x=/', active: true });
  });

  it('opens a background tab when asked to', async () => {
    const create = withChrome(jest.fn().mockResolvedValue({}));
    await expect(
      openInNewTab('https://miro.com/app/board/x=/', { background: true }),
    ).resolves.toBe(true);
    expect(create).toHaveBeenCalledWith({ url: 'https://miro.com/app/board/x=/', active: false });
  });

  it('never calls tabs.create for unsafe or unusable addresses', async () => {
    const create = withChrome(jest.fn());
    for (const bad of [
      'javascript:alert(1)',
      'data:text/html,x',
      'file:///etc/passwd',
      'foo',
      '',
    ]) {
      await expect(openInNewTab(bad)).resolves.toBe(false);
    }
    expect(create).not.toHaveBeenCalled();
  });

  it('returns false if the tab cannot be created', async () => {
    withChrome(jest.fn().mockRejectedValue(new Error('no window')));
    await expect(openInNewTab('https://miro.com/app/board/x=/')).resolves.toBe(false);
  });
});
