const { chromium } = require('playwright');

describe('Popup UI E2E', () => {
  it('should show password list and save entry', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('chrome-extension://<EXT_ID>/popup.html');
    // Simulate UI interactions here
    // Example: await page.click('#savePassword');
    await browser.close();
  });
});
