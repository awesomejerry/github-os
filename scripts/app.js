// GitHub OS - Main Application

import { Terminal } from './terminal.js';
import { commands } from './commands.js';
import { detectGitHubUser } from './utils.js';
import { DEFAULT_GITHUB_USER } from './config.js';

class GitHubOS {
  constructor() {
    this.terminal = new Terminal();
    this.githubUser = detectGitHubUser(DEFAULT_GITHUB_USER);
    
    // Set up command handler
    this.terminal.onCommand = this.executeCommand.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    this.printWelcome();
    this.terminal.updatePrompt();
    
    // Preload repositories
    await this.loadRepos();
    
    // Focus input
    this.terminal.focus();
  }

  /**
   * Print welcome message
   */
  printWelcome() {
    const welcomeText = `
<span class="welcome">Welcome to GitHub OS v1.0.0</span>
Connecting to GitHub user: <span class="success">${this.githubUser}</span>

Type <span class="info">'help'</span> for available commands.

`;
    this.terminal.print(welcomeText);
  }

  /**
   * Preload repositories
   */
  async loadRepos() {
    try {
      this.terminal.print(`<span class="info">Loading repositories...</span>`);
      const repos = await import('./github.js').then(m => m.fetchUserRepos(this.githubUser));
      this.terminal.print(`<span class="success">Loaded ${repos.length} repositories</span>\n`);
    } catch (error) {
      this.terminal.print(`<span class="error">Error: ${error.message}</span>\n`);
    }
  }

  /**
   * Execute a command
   */
  async executeCommand(cmdLine) {
    const parts = cmdLine.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Print command with prompt
    this.terminal.printCommand(cmdLine);

    // Execute command
    if (commands[cmd]) {
      await commands[cmd](this.terminal, this.githubUser, args);
    } else {
      this.terminal.print(`<span class="error">Command not found: ${cmd}. Type 'help' for available commands.</span>`);
    }
    
    this.terminal.print(''); // Add spacing
  }
}

// Initialize on page load
const app = new GitHubOS();
app.init();
