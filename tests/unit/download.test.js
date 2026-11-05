import { backupFilename } from '../../src/shared/download';

describe('backupFilename', () => {
  it('uses the ISO date', () => {
    expect(backupFilename(new Date('2026-11-05T10:00:00Z'))).toBe('draob-backup-2026-11-05.json');
  });
});
