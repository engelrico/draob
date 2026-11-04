const PasswordEntry = require('../../src/models/PasswordEntry');

describe('PasswordEntry', () => {
  it('should create a password entry', () => {
    const entry = new PasswordEntry('Board1', 'https://miro.com/app/board/123', 'secret');
    expect(entry.title).toBe('Board1');
    expect(entry.url).toBe('https://miro.com/app/board/123');
    expect(entry.password).toBe('secret');
  });
});
