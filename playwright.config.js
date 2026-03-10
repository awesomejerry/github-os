// Playwright config for mocked e2e smoke tests
const { devices } = require('@playwright/test');

module.exports = {
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    ignoreHTTPSErrors: true
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
};
