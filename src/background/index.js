// Service worker: shows a badge on tabs that are Miro boards (reported by the content script).
// Opening the popup programmatically is not reliable (needs a user gesture), so we only hint.
import { handleMessage } from './badge';

chrome.runtime.onMessage.addListener((message, sender) => {
  handleMessage(message, sender, chrome.action);
});
