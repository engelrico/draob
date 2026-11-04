// Runs only on miro.com/app/board/* (see manifest). Tells the service worker that this tab is a
// board so it can show the action badge. No page access, no data leaves the page.
import { BOARD_DETECTED } from '../shared/messages';

chrome.runtime.sendMessage({ type: BOARD_DETECTED });
