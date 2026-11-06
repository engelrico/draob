// Turns a saved address into something safe to open in a new tab, or null.
// Only http(s) is allowed; a missing scheme ("miro.com/app/board/...") gets https:// prepended.
export function toOpenableUrl(value) {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw || /\s/.test(raw)) return null;

  // "javascript:", "data:", "file:" ... have a scheme; "localhost:3000/x" is host:port, not a scheme.
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^[^/?#:]+:\d+(?:[/?#]|$)/.test(raw);
  const candidate = hasScheme ? raw : `https://${raw.replace(/^\/\//, '')}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    const { hostname } = url;
    // A bare word like "foo" is not an address worth opening.
    if (!hostname.includes('.') && hostname !== 'localhost' && !hostname.startsWith('['))
      return null;
    return url.href;
  } catch {
    return null;
  }
}
