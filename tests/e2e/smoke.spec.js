const { test, expect } = require('@playwright/test');

test('smoke: release view flow with mocked GitHub API', async ({ page }) => {
  // Mock GitHub API
  await page.route('https://api.github.com/**', async route => {
    const url = route.request().url();
    if (url.includes('/users/awesomejerry/repos')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ name: 'github-os' }]) });
    }
    if (url.includes('/repos/awesomejerry/github-os/releases/tags/v2.5.1')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tag_name:'v2.5.1', name:'Release 2.5.1', author:{login:'awesomejerry'}, published_at:'2026-03-04T14:00:00Z', body:'Release notes for v2.5.1', html_url:'https://github.com/awesomejerry/github-os/releases/tag/v2.5.1' }) });
    }
    if (url.includes('/releases')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ tag_name:'v2.5.1', name:'Release 2.5.1', author:{login:'awesomejerry'}, published_at:'2026-03-04T14:00:00Z', html_url:'https://github.com/awesomejerry/github-os/releases/tag/v2.5.1' }]) });
    }
    if (url.includes('/repos/awesomejerry/github-os')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name:'github-os', full_name:'awesomejerry/github-os', default_branch:'main' }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.goto('http://127.0.0.1:4173/');
  await page.fill('#command-input', 'connect awesomejerry');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  await page.fill('#command-input', 'cd github-os');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);

  await page.fill('#command-input', 'release view v2.5.1');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  const output = await page.locator('#output').innerText();
  expect(output).toContain('v2.5.1');
  expect(output).toContain('Release 2.5.1');
  expect(output).toContain('Release notes for v2.5.1');
});
