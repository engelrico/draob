// Pure helpers for working with many entries: search, sort, tags, duplicates.
import { boardIdOf } from './miro';

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 24;

/** Lowercase, strip accents: "Café" -> "cafe". */
export const fold = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();

export const normalizeTag = (tag) =>
  String(tag ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_TAG_LENGTH);

/** Trims, drops empties and case-insensitive duplicates, caps the count. */
export function normalizeTags(tags = []) {
  const seen = new Set();
  const out = [];
  for (const raw of tags) {
    const tag = normalizeTag(raw);
    const key = fold(tag);
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out.slice(0, MAX_TAGS);
}

/** Query words are ANDed over title, url and tags; every active tag must be present. */
export function filterEntries(entries, { query = '', tags = [], favoritesOnly = false } = {}) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  const wanted = tags.map(fold);
  return entries.filter((entry) => {
    if (favoritesOnly && !entry.favorite) return false;
    const entryTags = (entry.tags ?? []).map(fold);
    if (!wanted.every((t) => entryTags.includes(t))) return false;
    const haystack = fold([entry.title, entry.url, ...(entry.tags ?? [])].join(' '));
    return words.every((w) => haystack.includes(w));
  });
}

/** Favorites first, then alphabetical (German collation). */
export function sortEntries(entries) {
  return [...entries].sort(
    (a, b) =>
      Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) ||
      a.title.localeCompare(b.title, 'de', { sensitivity: 'base' }),
  );
}

/** All tags with usage count, most used first. Display form is the first spelling seen. */
export function collectTags(entries) {
  const map = new Map();
  for (const entry of entries) {
    for (const tag of entry.tags ?? []) {
      const key = fold(tag);
      const known = map.get(key);
      if (known) known.count += 1;
      else map.set(key, { tag, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'de'));
}

/** Groups of entries pointing at the same Miro board; newest first within a group. */
export function findDuplicateGroups(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const id = boardIdOf(entry.url);
    if (!id) continue;
    groups.set(id, [...(groups.get(id) ?? []), entry]);
  }
  return [...groups.values()]
    .filter((g) => g.length > 1)
    .map((g) => g.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)));
}
