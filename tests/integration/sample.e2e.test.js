const { chromium } = require('playwright');

describe('Sample E2E Test', () => {
  it('should launch browser', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    expect(await page.title()).toBe('Example Domain');
    await browser.close();
  });
});
