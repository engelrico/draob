import { BOARD_DETECTED } from '../shared/messages';

export const BADGE_TEXT = '●';
export const BADGE_COLOR = '#ffd02f';
export const BADGE_TITLE = 'MiroHero: Passwort für dieses Board';

/** Marks the sender's tab with a badge. Returns true if the message was handled. */
export function handleMessage(message, sender, action) {
  const tabId = sender?.tab?.id;
  if (message?.type !== BOARD_DETECTED || tabId === undefined) return false;
  action.setBadgeText({ tabId, text: BADGE_TEXT });
  action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR });
  action.setTitle({ tabId, title: BADGE_TITLE });
  return true;
}
