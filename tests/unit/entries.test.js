import {
  collectTags,
  filterEntries,
  findDuplicateGroups,
  fold,
  normalizeTags,
  sortEntries,
} from '../../src/shared/entries';

const e = (title, extra = {}) => ({
  id: title,
  title,
  url: `https://example.com/${title}`,
  tags: [],
  favorite: false,
  ...extra,
});

describe('normalizeTags', () => {
  it('trims, collapses spaces, dedupes case/accent-insensitively and caps', () => {
    expect(normalizeTags(['  Kunde   A ', 'kunde a', 'Café', 'cafe', ''])).toEqual([
      'Kunde A',
      'Café',
    ]);
    expect(normalizeTags(Array.from({ length: 20 }, (_, i) => `t${i}`))).toHaveLength(10);
    expect(normalizeTags(['x'.repeat(50)])[0]).toHaveLength(24);
  });
});

describe('filterEntries', () => {
  const list = [
    e('Sprint Planung', { tags: ['Kunde A', 'Agil'] }),
    e('Retro Café', { tags: ['Agil'], favorite: true }),
    e('Roadmap', { tags: ['Kunde B'], url: 'https://miro.com/app/board/abc=/' }),
  ];
  const titles = (r) => r.map((x) => x.title);

  it('matches title, url and tags, ignoring case and accents', () => {
    expect(titles(filterEntries(list, { query: 'CAFE' }))).toEqual(['Retro Café']);
    expect(titles(filterEntries(list, { query: 'abc=' }))).toEqual(['Roadmap']);
    expect(titles(filterEntries(list, { query: 'kunde b' }))).toEqual(['Roadmap']);
  });

  it('ANDs multiple words and multiple tags', () => {
    expect(titles(filterEntries(list, { query: 'sprint agil' }))).toEqual(['Sprint Planung']);
    expect(titles(filterEntries(list, { query: 'sprint roadmap' }))).toEqual([]);
    expect(titles(filterEntries(list, { tags: ['agil', 'kunde a'] }))).toEqual(['Sprint Planung']);
  });

  it('supports favorites only and an empty filter', () => {
    expect(titles(filterEntries(list, { favoritesOnly: true }))).toEqual(['Retro Café']);
    expect(filterEntries(list)).toHaveLength(3);
  });
});

describe('sortEntries', () => {
  it('puts favorites first, then sorts German alphabetically without mutating', () => {
    const list = [e('zebra'), e('Ärger'), e('Anton'), e('mitte', { favorite: true })];
    expect(sortEntries(list).map((x) => x.title)).toEqual(['mitte', 'Anton', 'Ärger', 'zebra']);
    expect(list[0].title).toBe('zebra');
  });
});

describe('collectTags', () => {
  it('counts tags and orders by usage', () => {
    const tags = collectTags([
      e('a', { tags: ['Agil', 'Kunde'] }),
      e('b', { tags: ['agil'] }),
      e('c', { tags: ['Kunde', 'Agil'] }),
    ]);
    expect(tags).toEqual([
      { tag: 'Agil', count: 3 },
      { tag: 'Kunde', count: 2 },
    ]);
  });
});

describe('findDuplicateGroups', () => {
  it('groups entries of the same board, newest first, ignoring other urls', () => {
    const groups = findDuplicateGroups([
      e('old', { url: 'https://miro.com/app/board/abc=/', updatedAt: 1 }),
      e('new', { url: 'https://eu.miro.com/app/board/abc=/?q=1', updatedAt: 2 }),
      e('single', { url: 'https://miro.com/app/board/zzz=/' }),
      e('x1', { url: 'https://example.com/a' }),
      e('x2', { url: 'https://example.com/a' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].map((x) => x.title)).toEqual(['new', 'old']);
  });
});

describe('fold', () => {
  it('strips accents and case', () => {
    expect(fold('Ärger Straße')).toBe('arger straße');
  });
});
