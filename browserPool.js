const { chromium } = require('playwright-chromium');

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
}

async function closeBrowser() {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch (e) {
      console.error('Error closing browser instance:', e && e.message ? e.message : e);
    } finally {
      browserInstance = null;
    }
  }
}

module.exports = { getBrowser, closeBrowser };
