const UserSettings = require('../../src/models/UserSettings');

describe('UserSettings', () => {
  it('should create user settings', () => {
    const settings = new UserSettings({ theme: 'dark' }, { canEdit: true });
    expect(settings.preferences.theme).toBe('dark');
    expect(settings.permissions.canEdit).toBe(true);
  });
});
