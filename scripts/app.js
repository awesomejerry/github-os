// GitHub OS - Main Application

import { Terminal } from './terminal.js';
import { commands, getCompletions } from './commands.js';
import { detectGitHubUser } from './utils.js';
import { DEFAULT_GITHUB_USER } from './config.js';
import { clearUserCache } from './github.js';
import { loadSession, isAuthenticated } from './session.js';
import { validateToken } from './auth.js';

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
    // Check for auth callback success
    this.checkAuthCallback();
    
    // Validate existing session
    await this.validateSession();
    
    this.printWelcome();
    this.terminal.updatePrompt();
    
    // Preload repositories
    await this.loadRepos();
    
    // Focus input
    this.terminal.focus();
  }

  /**
   * Check for auth callback success message
   */
  checkAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Remove the query param
      window.history.replaceState({}, '', 'index.html');
    }
  }

  /**
   * Validate existing session token
   */
  async validateSession() {
    const session = loadSession();
    if (session && session.accessToken) {
      try {
        const isValid = await validateToken(session.accessToken);
        if (!isValid) {
          // Token is invalid, clear session silently
          const { clearSession } = await import('./session.js');
          clearSession();
        }
      } catch {
        // Validation failed, continue without clearing
        // User can manually logout if needed
      }
    }
  }

  /**
   * Print welcome message
   */
  printWelcome() {
    const session = loadSession();
    const loggedIn = session && session.username;
    const userDisplay = loggedIn ? session.username : this.githubUser;
    const statusText = loggedIn ? '(logged in)' : '(anonymous)';
    
    const welcomeText = `
<span class="welcome">Welcome to GitHub OS v2.0.0</span>
Connecting to GitHub user: <span class="success">${userDisplay}</span> <span class="info">${statusText}</span>

Type <span class="info">'help'</span> for available commands.
Type <span class="info">'login'</span> to authenticate with GitHub.

`;
    this.terminal.print(welcomeText);
  }

  /**
   * Preload repositories
   */
  async loadRepos() {
    try {
      this.terminal.print(`<span class="info">Loading repositories...</span>`);
      
      // Clear repo cache to ensure fresh data (important for auth status changes)
      const { clearCache } = await import('./github.js');
      clearCache();
      
      const repos = await import('./github.js').then(m => m.fetchUserRepos(this.githubUser));
      
      // Count private repos if authenticated
      const { isAuthenticated } = await import('./session.js');
      let statusMsg = `Loaded ${repos.length} repositories`;
      if (isAuthenticated()) {
        const privateCount = repos.filter(r => r.private).length;
        if (privateCount > 0) {
          statusMsg += ` (${privateCount} private)`;
        }
      }
      
      this.terminal.print(`<span class="success">${statusMsg}</span>\n`);
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
   * Handle tab completion with cycling
   */
  async handleTabComplete(input) {
    const tabState = this.terminal.getTabState();
    
    // If tab state is active and input matches last completion, cycle through matches
    if (tabState.active && tabState.lastInput === input && tabState.matches.length > 1) {
      tabState.index = (tabState.index + 1) % tabState.matches.length;
      this.terminal.setTabState(tabState);
      
      const match = tabState.matches[tabState.index];
      const completed = this.buildCompletion(tabState.context, match);
      this.terminal.setInput(completed);
      this.terminal.setTabState({ lastInput: completed });
      return;
    }
    
    // New tab completion - get matches
    const result = await getCompletions(this.githubUser, this.terminal.getPath(), input);
    
    if (!result || result.matches.length === 0) {
      return; // No matches
    }
    
    if (result.matches.length === 1) {
      // Single match - complete it
      const completed = this.buildCompletion(result, result.matches[0]);
      this.terminal.setInput(completed);
      this.terminal.resetTabState();
      return;
    }
    
    // Multiple matches - start cycling
    const firstMatch = result.matches[0];
    const completed = this.buildCompletion(result, firstMatch);
    
    this.terminal.setTabState({
      active: true,
      matches: result.matches,
      index: 0,
      lastInput: completed,
      context: result
    });
    
    this.terminal.setInput(completed);
  }
  
  /**
   * Build completion string from match
   */
  buildCompletion(result, match) {
    if (result.isCommand) {
      return match + ' ';
    }
    
    const fullMatch = result.dirPath ? `${result.dirPath}/${match}` : match;
    return result.baseCmd ? `${result.baseCmd} ${fullMatch}` : fullMatch;
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
