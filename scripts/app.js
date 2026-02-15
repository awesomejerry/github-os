// GitHub OS - Main Application

import { Terminal } from './terminal.js';
import { commands, getCompletions } from './commands.js';
import { detectGitHubUser } from './utils.js';
import { DEFAULT_GITHUB_USER } from './config.js';
import { clearUserCache } from './github.js';

class GitHubOS {
  constructor() {
    this.terminal = new Terminal();
    this.githubUser = detectGitHubUser(DEFAULT_GITHUB_USER);
    
    // Set up command handler
    this.terminal.onCommand = this.executeCommand.bind(this);
    
    // Set up tab completion
    this.terminal.onTabComplete = this.handleTabComplete.bind(this);
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
<span class="welcome">Welcome to GitHub OS v1.1.0</span>
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
      await commands[cmd](this.terminal, this.githubUser, args, this);
    } else {
      this.terminal.print(`<span class="error">Command not found: ${cmd}. Type 'help' for available commands.</span>`);
    }
    
    this.terminal.print(''); // Add spacing
  }

  /**
   * Handle tab completion
   */
  async handleTabComplete(input) {
    const completion = await getCompletions(this.githubUser, this.terminal.getPath(), input);
    
    if (typeof completion === 'string') {
      // Single match - complete it
      this.terminal.setInput(completion + ' ');
    } else if (completion && completion.matches) {
      // Multiple matches - show them
      this.terminal.print(`<span class="prompt">${this.terminal.promptEl.textContent}</span> <span class="command">${input}</span>`);
      const matchStr = completion.matches.join('  ');
      this.terminal.print(matchStr);
    }
  }

  /**
   * Set GitHub user (for connect command)
   */
  setGithubUser(username) {
    this.githubUser = username;
    clearUserCache(username);
  }
}

// Initialize on page load
const app = new GitHubOS();
app.init();
