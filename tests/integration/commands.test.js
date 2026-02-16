import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Commands', () => {
  // Mock terminal
  function createMockTerminal(path = '/github-os') {
    const outputs = [];
    return {
      outputs,
      print: vi.fn((text) => outputs.push(text)),
      getPath: vi.fn(() => path),
      setInput: vi.fn(),
      setTabState: vi.fn(),
      resetTabState: vi.fn()
    };
  }

  describe('Command Registry', () => {
    it('should have all expected commands registered', async () => {
      const { commands } = await import('../../scripts/commands.js');
      
      const expectedCommands = [
        'help', 'ls', 'cd', 'pwd', 'cat', 'tree', 'clear', 'exit',
        'whoami', 'connect', 'info', 'readme', 'head', 'tail', 'download',
        'grep', 'log', 'branch', 'find'
      ];
      
      expectedCommands.forEach(cmd => {
        expect(commands).toHaveProperty(cmd);
        expect(typeof commands[cmd]).toBe('function');
      });
    });
  });

  describe('help command', () => {
    it('should display help text with all commands', async () => {
      const terminal = createMockTerminal();
      const { commands } = await import('../../scripts/commands.js');
      
      await commands.help(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Available Commands');
      expect(output).toContain('ls');
      expect(output).toContain('cd');
      expect(output).toContain('cat');
      expect(output).toContain('log');
      expect(output).toContain('branch');
      expect(output).toContain('find');
    });
  });

  describe('pwd command', () => {
    it('should print current working directory', async () => {
      const terminal = createMockTerminal('/github-os/src');
      const { commands } = await import('../../scripts/commands.js');
      
      await commands.pwd(terminal, 'testuser', []);
      
      expect(terminal.outputs[0]).toBe('/github-os/src');
    });

    it('should show root directory', async () => {
      const terminal = createMockTerminal('/');
      const { commands } = await import('../../scripts/commands.js');
      
      await commands.pwd(terminal, 'testuser', []);
      
      expect(terminal.outputs[0]).toBe('/');
    });
  });

  describe('whoami command', () => {
    it('should show current GitHub user', async () => {
      const terminal = createMockTerminal();
      const { commands } = await import('../../scripts/commands.js');
      
      await commands.whoami(terminal, 'awesomejerry', []);
      
      expect(terminal.outputs[0]).toContain('awesomejerry');
    });
  });

  describe('clear command', () => {
    it('should call clear on terminal', async () => {
      const terminal = createMockTerminal();
      terminal.clear = vi.fn();
      const { commands } = await import('../../scripts/commands.js');
      
      await commands.clear(terminal, 'testuser', []);
      
      expect(terminal.clear).toHaveBeenCalled();
    });
  });

  describe('exit command', () => {
    it('should display goodbye message', async () => {
      const terminal = createMockTerminal();
      const { commands } = await import('../../scripts/commands.js');
      
      await commands.exit(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toMatch(/goodbye|exit/i);
    });
  });

  describe('Command Registry - issues command', () => {
    it('should have issues command registered', async () => {
      const { commands } = await import('../../scripts/commands.js');
      
      expect(commands).toHaveProperty('issues');
      expect(typeof commands.issues).toBe('function');
    });
  });

  describe('help command with issues', () => {
    it('should display issues command in help text', async () => {
      const terminal = createMockTerminal();
      const { commands } = await import('../../scripts/commands.js');
      
      await commands.help(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('issues');
    });
  });
});
