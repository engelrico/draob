import PasswordEntry from '../../src/shared/models/PasswordEntry';

describe('PasswordEntry', () => {
  it('stores title, url and password', () => {
    const entry = new PasswordEntry('Board1', 'https://miro.com/app/board/123', 'secret');
    expect(entry).toMatchObject({
      title: 'Board1',
      url: 'https://miro.com/app/board/123',
      password: 'secret',
    });
  });
});
