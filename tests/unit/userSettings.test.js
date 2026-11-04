import UserSettings from '../../src/shared/models/UserSettings';

describe('UserSettings', () => {
  it('stores preferences and permissions', () => {
    const settings = new UserSettings({ theme: 'dark' }, { canEdit: true });
    expect(settings.preferences.theme).toBe('dark');
    expect(settings.permissions.canEdit).toBe(true);
  });
});
