import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function createMockTerminal(path = '/github-os') {
  const outputs = [];
  return {
    outputs,
    print: vi.fn((text) => outputs.push(text)),
    printCode: vi.fn(),
    clear: vi.fn(),
    getPath: vi.fn(() => path),
    setPath: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn()
  };
}

const originalFetch = global.fetch;

describe('release command feature coverage', () => {
  let terminal;

  beforeEach(() => {
    vi.resetModules();
    terminal = createMockTerminal('/github-os');

    global.fetch = vi.fn(async (url) => {
      if (url.includes('/releases/tags/v2.5.1')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            tag_name: 'v2.5.1',
            name: 'Release 2.5.1',
            author: { login: 'awesomejerry' },
            published_at: '2026-03-04T14:00:00Z',
            prerelease: false,
            draft: false,
            body: 'Release notes for v2.5.1',
            html_url: 'https://github.com/awesomejerry/github-os/releases/tag/v2.5.1'
          })
        });
      }

      if (url.includes('/releases/tags/not-found')) {
        return Promise.resolve({ ok: false, status: 404 });
      }

      if (url.includes('/releases?per_page=3')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ([
            {
              tag_name: 'v2.5.1',
              name: 'Release 2.5.1',
              author: { login: 'awesomejerry' },
              published_at: '2026-03-04T14:00:00Z',
              prerelease: false,
              html_url: 'https://github.com/awesomejerry/github-os/releases/tag/v2.5.1'
            }
          ])
        });
      }

      return Promise.resolve({ ok: false, status: 404 });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('supports release view <tag> and renders detail fields', async () => {
    const { commands } = await import('../../scripts/commands.js');

    await commands.release(terminal, 'awesomejerry', ['view', 'v2.5.1']);

    const output = terminal.outputs.join('\n');
    expect(output).toContain('v2.5.1');
    expect(output).toContain('Release 2.5.1');
    expect(output).toContain('@awesomejerry');
    expect(output).toContain('Release notes');
    expect(output).toContain('releases/tag/v2.5.1');
  });

  it('shows usage when tag is missing for release view', async () => {
    const { commands } = await import('../../scripts/commands.js');

    await commands.release(terminal, 'awesomejerry', ['view']);

    const output = terminal.outputs.join('\n');
    expect(output).toContain('Usage: release view');
  });

  it('shows clear error when release tag is not found', async () => {
    const { commands } = await import('../../scripts/commands.js');

    await commands.release(terminal, 'awesomejerry', ['view', 'not-found']);

    const output = terminal.outputs.join('\n');
    expect(output).toMatch(/Release not found|Error:/);
  });

  it('keeps alias behavior for release [count]', async () => {
    const { commands } = await import('../../scripts/commands.js');

    await commands.release(terminal, 'awesomejerry', ['3']);

    const output = terminal.outputs.join('\n');
    expect(output).toContain('v2.5.1');
    expect(output).toContain('Release 2.5.1');
  });
});
