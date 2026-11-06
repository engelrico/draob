import { toOpenableUrl } from '../../src/shared/links';

describe('toOpenableUrl', () => {
  it('keeps normal http and https addresses, including query and hash', () => {
    expect(toOpenableUrl('https://miro.com/app/board/uXjV=/')).toBe(
      'https://miro.com/app/board/uXjV=/',
    );
    expect(toOpenableUrl('http://example.com/a?b=1#c')).toBe('http://example.com/a?b=1#c');
    expect(toOpenableUrl('  https://eu.miro.com/app/board/x=/?moveToWidget=1  ')).toBe(
      'https://eu.miro.com/app/board/x=/?moveToWidget=1',
    );
  });

  it('adds https:// when the scheme is missing', () => {
    expect(toOpenableUrl('miro.com/app/board/x=/')).toBe('https://miro.com/app/board/x=/');
    expect(toOpenableUrl('//miro.com/x')).toBe('https://miro.com/x');
    expect(toOpenableUrl('localhost:3000/app')).toBe('https://localhost:3000/app');
  });

  it('rejects every other scheme', () => {
    for (const bad of [
      'javascript:alert(1)',
      'JAVASCRIPT:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'file:///etc/passwd',
      'chrome://settings',
      'chrome-extension://abc/popup.html',
      'about:blank',
      'blob:https://miro.com/123',
      'mailto:a@b.de',
      'ftp://example.com',
    ]) {
      expect([bad, toOpenableUrl(bad)]).toEqual([bad, null]);
    }
  });

  it('rejects empty, spaced and unusable input', () => {
    for (const bad of [
      '',
      '   ',
      'foo',
      'Sprint Board',
      'https://',
      'http://exa mple.com',
      null,
      undefined,
      42,
      {},
    ]) {
      expect([bad, toOpenableUrl(bad)]).toEqual([bad, null]);
    }
  });
});
