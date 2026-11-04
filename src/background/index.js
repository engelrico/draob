// Service worker: opens the popup when a Miro board finished loading.
const BOARD_URL_PART = 'miro.com/app/board/';
const OPEN_DELAY_MS = 5000;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes(BOARD_URL_PART)) {
    // TODO(spec 001): openPopup usually needs a user gesture; replace with a badge/side panel.
    setTimeout(() => chrome.action.openPopup(), OPEN_DELAY_MS);
  }
});
