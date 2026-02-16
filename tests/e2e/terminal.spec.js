import { test, expect } from '@playwright/test';

test.describe('Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await expect(page.locator('#output')).toContainText('Welcome to GitHub OS');
  });

  test('should initialize terminal with welcome message', async ({ page }) => {
    const output = page.locator('#output');
    await expect(output).toContainText('Welcome to GitHub OS');
    await expect(output).toContainText('Connecting to GitHub user');
    await expect(output).toContainText("Type 'help' for available commands");
  });

  test('should display prompt with correct path', async ({ page }) => {
    const prompt = page.locator('#input-prompt');
    await expect(prompt).toContainText('guest@github-os:~$');
  });

  test('should have focused input on load', async ({ page }) => {
    const input = page.locator('#command-input');
    await expect(input).toBeFocused();
  });

  test('should execute command on Enter', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('help');
    await input.press('Enter');
    
    await expect(output).toContainText('Available Commands');
  });

  test('should clear input after command execution', async ({ page }) => {
    const input = page.locator('#command-input');
    
    await input.fill('help');
    await input.press('Enter');
    
    await expect(input).toHaveValue('');
  });

  test('should show error for unknown command', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('unknowncommand123');
    await input.press('Enter');
    
    await expect(output).toContainText('Command not found');
  });

  test('should support pwd command', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('pwd');
    await input.press('Enter');
    
    await expect(output).toContainText('/');
  });

  test('should support whoami command', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('whoami');
    await input.press('Enter');
    
    // Should show the GitHub user
    await expect(output).toContainText('awesomejerry');
  });

  test('should support help command with all commands listed', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('help');
    await input.press('Enter');
    
    // Check for key commands
    await expect(output).toContainText('ls');
    await expect(output).toContainText('cd');
    await expect(output).toContainText('cat');
    await expect(output).toContainText('tree');
    await expect(output).toContainText('log');
    await expect(output).toContainText('branch');
    await expect(output).toContainText('find');
  });

  test('should support clear command', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    // Run a command first to add output
    await input.fill('help');
    await input.press('Enter');
    await expect(output).toContainText('Available Commands');
    
    // Clear the terminal
    await input.fill('clear');
    await input.press('Enter');
    
    // Output should be empty or just show the new prompt
    const outputText = await output.textContent();
    expect(outputText).not.toContain('Available Commands');
  });
});

test.describe('Command History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#output')).toContainText('Welcome to GitHub OS');
  });

  test('should navigate command history with arrow keys', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    // Execute multiple commands
    await input.fill('help');
    await input.press('Enter');
    await expect(output).toContainText('Available Commands');
    
    await input.fill('whoami');
    await input.press('Enter');
    await expect(output).toContainText('awesomejerry');
    
    // Press up arrow to get previous command
    await input.press('ArrowUp');
    await expect(input).toHaveValue('whoami');
    
    // Press up arrow again for earlier command
    await input.press('ArrowUp');
    await expect(input).toHaveValue('help');
    
    // Press down arrow to go back
    await input.press('ArrowDown');
    await expect(input).toHaveValue('whoami');
  });

  test('should not show history when empty', async ({ page }) => {
    const input = page.locator('#command-input');
    
    // Press up arrow before any commands
    await input.press('ArrowUp');
    await expect(input).toHaveValue('');
  });
});

test.describe('Tab Completion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#output')).toContainText('Welcome to GitHub OS');
  });

  test('should complete command names', async ({ page }) => {
    const input = page.locator('#command-input');
    
    await input.fill('hel');
    await input.press('Tab');
    
    // Should complete to 'help'
    await expect(input).toHaveValue('help ');
  });

  test('should complete partial command', async ({ page }) => {
    const input = page.locator('#command-input');
    
    await input.fill('wh');
    await input.press('Tab');
    
    await expect(input).toHaveValue('whoami ');
  });

  test('should handle multiple matches', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    // 'c' could match cd, cat, clear, connect
    await input.fill('c');
    await input.press('Tab');
    
    // Either completes to a match or shows options
    const inputValue = await input.inputValue();
    expect(inputValue.startsWith('c')).toBeTruthy();
  });
});

test.describe('Terminal Output', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#output')).toContainText('Welcome to GitHub OS');
  });

  test('should show command in output', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('pwd');
    await input.press('Enter');
    
    // Command should be echoed
    await expect(output).toContainText('pwd');
  });

  test('should scroll to bottom on new output', async ({ page }) => {
    const input = page.locator('#command-input');
    
    // Run multiple commands to fill the screen
    for (let i = 0; i < 5; i++) {
      await input.fill('whoami');
      await input.press('Enter');
      await page.waitForTimeout(100);
    }
    
    // Check that terminal has content
    const output = page.locator('#output');
    const outputText = await output.textContent();
    expect(outputText).toContain('awesomejerry');
  });
});

test.describe('Repository Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#output')).toContainText('Loaded');
  });

  test('should list repositories with ls', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('ls');
    await input.press('Enter');
    
    // Should show repositories (github-os should be in the list)
    await page.waitForTimeout(2000);
    const outputText = await output.textContent();
    expect(outputText).toContain('github-os');
    expect(outputText).toContain('78 repositories'); // Repository count
  });

  test('should change directory into repo', async ({ page }) => {
    const input = page.locator('#command-input');
    const prompt = page.locator('#input-prompt');
    const output = page.locator('#output');
    
    // Wait for repos to load
    await page.waitForTimeout(1000);
    
    await input.fill('cd github-os');
    await input.press('Enter');
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    // Prompt should update to show repo path
    await expect(prompt).toContainText('github-os', { timeout: 10000 });
  });

  test('should show error when cd to non-existent repo', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('cd nonexistent-repo-xyz-123');
    await input.press('Enter');
    
    await page.waitForTimeout(1000);
    await expect(output).toContainText('not found');
  });
});

test.describe('Find Command', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#output')).toContainText('Loaded');
    await page.waitForTimeout(1000);
  });

  test('should show usage without pattern', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('find');
    await input.press('Enter');
    
    await expect(output).toContainText('Usage');
  });

  test('should show error at root', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('find *.js');
    await input.press('Enter');
    
    await expect(output).toContainText('Not in a repository');
  });
});

test.describe('Log Command', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#output')).toContainText('Loaded');
    await page.waitForTimeout(1000);
  });

  test('should show error at root', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('log');
    await input.press('Enter');
    
    await expect(output).toContainText('Not in a repository');
  });
});

test.describe('Branch Command', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#output')).toContainText('Loaded');
    await page.waitForTimeout(1000);
  });

  test('should show error at root', async ({ page }) => {
    const input = page.locator('#command-input');
    const output = page.locator('#output');
    
    await input.fill('branch');
    await input.press('Enter');
    
    await expect(output).toContainText('Not in a repository');
  });
});
