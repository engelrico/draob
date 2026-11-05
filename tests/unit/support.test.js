import { DONATION_URL } from '../../src/shared/support';

describe('donation url', () => {
  it('is empty (hidden) or a plain https url', () => {
    expect(DONATION_URL === '' || /^https:\/\/[^\s]+$/.test(DONATION_URL)).toBe(true);
  });

  it('never uses a script or data scheme', () => {
    expect(DONATION_URL).not.toMatch(/^(javascript|data):/i);
  });
});
