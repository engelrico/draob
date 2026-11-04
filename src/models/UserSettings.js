// UserSettings entity for MiroHero Chrome Extension
class UserSettings {
  constructor(preferences = {}, permissions = {}) {
    this.preferences = preferences;
    this.permissions = permissions;
  }
}

module.exports = UserSettings;
