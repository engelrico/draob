import { cleanBoardTitle, isBoardUrl, normalizeBoardUrl } from './miro';

/**
 * Board of the active tab, or null. Works without the "tabs" permission: opening the popup via the
 * toolbar icon grants `activeTab`, which exposes url and title of that tab.
 */
export async function getActiveBoard() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url || !isBoardUrl(tab.url)) return null;
    return { url: normalizeBoardUrl(tab.url), title: cleanBoardTitle(tab.title) };
  } catch {
    return null;
  }
}
