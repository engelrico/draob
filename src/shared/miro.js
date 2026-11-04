// Helpers for Miro board URLs and page titles.
const BOARD_PATH = /^\/app\/board\/([^/]+)/;

function boardIdOf(url) {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== 'miro.com' && !hostname.endsWith('.miro.com')) return null;
    return BOARD_PATH.exec(pathname)?.[1] ?? null;
  } catch {
    return null;
  }
}

export const isBoardUrl = (url) => boardIdOf(url) !== null;

/** Canonical URL without query/hash, e.g. https://miro.com/app/board/<id>/ (null if not a board). */
export function normalizeBoardUrl(url) {
  const id = boardIdOf(url);
  return id ? `https://miro.com/app/board/${id}/` : null;
}

/** "Sprint Board | Miro" -> "Sprint Board". A bare "Miro" (page still loading) gives "". */
export function cleanBoardTitle(title = '') {
  const cleaned = title.replace(/\s*[|\-–—]\s*Miro\s*$/i, '').trim();
  return /^miro$/i.test(cleaned) ? '' : cleaned;
}

/** Finds a saved entry for the given board URL (compares board ids). */
export function findEntryByUrl(entries, url) {
  const id = boardIdOf(url);
  return id ? (entries.find((e) => boardIdOf(e.url) === id) ?? null) : null;
}
