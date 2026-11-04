export default class UserSettings {
  constructor(preferences = {}, permissions = {}) {
    this.preferences = preferences;
    this.permissions = permissions;
  }
}
