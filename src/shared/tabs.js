import { fillPasswordField } from './fillPassword';
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

/**
 * Types `password` into the password field of the active Miro board tab.
 * Needs a user gesture (activeTab) and the `scripting` permission.
 * @returns {Promise<'ok' | 'no-field' | 'no-board' | 'error'>}
 */
export async function fillPasswordInActiveTab(password) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !isBoardUrl(tab.url)) return 'no-board';
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillPasswordField,
      args: [password],
    });
    return result?.result ?? 'error';
  } catch {
    return 'error';
  }
}
