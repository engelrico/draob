import {
  cleanBoardTitle,
  findEntryByUrl,
  isBoardUrl,
  normalizeBoardUrl,
} from '../../src/shared/miro';

describe('miro helpers', () => {
  it('recognizes board urls only on miro.com', () => {
    expect(isBoardUrl('https://miro.com/app/board/uXjVL3abc=/')).toBe(true);
    expect(isBoardUrl('https://eu.miro.com/app/board/uXjVL3abc=/?x=1')).toBe(true);
    expect(isBoardUrl('https://miro.com/app/dashboard/')).toBe(false);
    expect(isBoardUrl('https://evil.com/app/board/abc/')).toBe(false);
    expect(isBoardUrl('https://notmiro.com/app/board/abc/')).toBe(false);
    expect(isBoardUrl('not a url')).toBe(false);
  });

  it('normalizes away query, hash and host variants', () => {
    expect(normalizeBoardUrl('https://eu.miro.com/app/board/uXjVL3abc=/?moveToWidget=1#x')).toBe(
      'https://miro.com/app/board/uXjVL3abc=/',
    );
    expect(normalizeBoardUrl('https://miro.com/app/board/uXjVL3abc=')).toBe(
      'https://miro.com/app/board/uXjVL3abc=/',
    );
    expect(normalizeBoardUrl('https://miro.com/')).toBeNull();
  });

  it('cleans the Miro suffix from page titles', () => {
    expect(cleanBoardTitle('Sprint Board | Miro')).toBe('Sprint Board');
    expect(cleanBoardTitle('Retro - Miro')).toBe('Retro');
    expect(cleanBoardTitle('Mirodrome')).toBe('Mirodrome');
    expect(cleanBoardTitle('Miro')).toBe('');
    expect(cleanBoardTitle(undefined)).toBe('');
  });

  it('finds an entry by board id regardless of url form', () => {
    const entries = [
      { id: 1, url: 'https://miro.com/app/board/aaa=/' },
      { id: 2, url: 'https://miro.com/app/board/bbb=/?share=1' },
    ];
    expect(findEntryByUrl(entries, 'https://eu.miro.com/app/board/bbb=')?.id).toBe(2);
    expect(findEntryByUrl(entries, 'https://miro.com/app/board/ccc=/')).toBeNull();
    expect(findEntryByUrl(entries, 'https://example.com')).toBeNull();
  });
});
