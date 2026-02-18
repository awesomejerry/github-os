// GitHub OS - Terminal UI

import { loadSession } from './session.js';

/**
 * Terminal class - handles all DOM interactions and display
 */
export class Terminal {
  constructor() {
    this.output = document.getElementById('output');
    this.input = document.getElementById('command-input');
    this.promptEl = document.getElementById('input-prompt');
    this.terminal = document.getElementById('terminal');
    
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentPath = '/';
    this.previousPath = null;
    this.currentBranch = null;
    
    // Tab completion state
    this.tabState = {
      active: false,
      matches: [],
      index: 0,
      originalInput: ''
    };
    
    this.setupEventListeners();
  }

  /**
   * Set up keyboard event listeners
   */
  setupEventListeners() {
    this.input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const cmdLine = this.input.value;
        this.input.value = '';
        this.resetTabState();
        
        if (cmdLine.trim()) {
          this.commandHistory.push(cmdLine);
          this.historyIndex = this.commandHistory.length;
          await this.onCommand(cmdLine);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.resetTabState();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.commandHistory[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.resetTabState();
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.input.value = this.commandHistory[this.historyIndex];
        } else {
          this.historyIndex = this.commandHistory.length;
          this.input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        await this.onTabComplete(this.input.value);
      } else if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        // Regular character or special key (not a modifier) - reset tab state
        this.resetTabState();
      }
    });

    // Focus input on click
    this.terminal.addEventListener('click', () => {
      this.input.focus();
    });
  }

  /**
   * Tab completion handler - to be set by app
   */
  onTabComplete = async (input) => {
    // Override this in app.js
    console.log('Tab complete:', input);
  }

  /**
   * Reset tab completion state
   */
  resetTabState() {
    this.tabState = {
      active: false,
      matches: [],
      index: 0,
      originalInput: ''
    };
  }

  /**
   * Get tab state
   */
  getTabState() {
    return this.tabState;
  }

  /**
   * Set tab state
   */
  setTabState(state) {
    this.tabState = { ...this.tabState, ...state };
  }

  /**
   * Command handler - to be set by app
   */
  onCommand = async (cmdLine) => {
    // Override this in app.js
    console.log('Command:', cmdLine);
  }

  /**
   * Print text to terminal
   */
  print(text, className = '') {
    // Check scroll position BEFORE adding content
    const wasAtBottom = this.isScrolledToBottom();
    const line = document.createElement('div');
    line.className = 'line ' + className;
    line.innerHTML = text;
    this.output.appendChild(line);
    if (wasAtBottom) {
      this.terminal.scrollTop = this.terminal.scrollHeight;
    }
  }

  /**
   * Print command with prompt
   */
  printCommand(cmdLine) {
    this.print(`<span class="prompt">${this.promptEl.textContent}</span> <span class="command">${cmdLine}</span>`);
  }

  /**
   * Print code block with syntax highlighting
   */
  printCode(code, language) {
    // Check scroll position BEFORE adding content
    const wasAtBottom = this.isScrolledToBottom();
    const pre = document.createElement('pre');
    const codeEl = document.createElement('code');
    codeEl.className = `language-${language}`;
    codeEl.textContent = code;
    pre.appendChild(codeEl);
    
    this.output.appendChild(pre);
    
    // Apply syntax highlighting
    if (window.hljs) {
      hljs.highlightElement(codeEl);
    }
    
    if (wasAtBottom) {
      this.terminal.scrollTop = this.terminal.scrollHeight;
    }
  }

  /**
   * Check if user is scrolled to bottom
   */
  isScrolledToBottom() {
    // +1 for a small buffer
    return this.terminal.scrollHeight - this.terminal.clientHeight <= this.terminal.scrollTop + 1;
  }

  /**
   * Scroll to bottom of terminal (always)
   */
  scrollToBottom() {
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  /**
   * Show loading indicator
   */
  showLoading(message = 'Loading...') {
    // Remove any existing loading indicator
    this.hideLoading();
    
    // Create and append loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.id = 'loading-indicator';
    loadingEl.className = 'loading';
    loadingEl.innerHTML = `<span class="info">${message}</span>`;
    this.output.appendChild(loadingEl);
    this.scrollToBottom();
    
    // Store reference for removal
    this.loadingElement = loadingEl;
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.remove();
      this.loadingElement = null;
    }
    // Also try to remove by ID in case reference was lost
    const existing = document.getElementById('loading-indicator');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Update prompt based on current path and auth status
   */
  updatePrompt() {
    const pathDisplay = this.currentPath === '/' ? '~' : `~${this.currentPath}`;
    const session = loadSession();
    const user = session?.username || 'guest';
    this.promptEl.textContent = `${user}@github-os:${pathDisplay}$`;
  }

  /**
   * Set current path
   */
  setPath(path) {
    this.previousPath = this.currentPath;
    this.currentPath = path;
    this.updatePrompt();
  }

  /**
   * Get current path
   */
  getPath() {
    return this.currentPath;
  }

  /**
   * Get previous path
   */
  getPreviousPath() {
    return this.previousPath;
  }

  /**
   * Set current branch
   */
  setCurrentBranch(branch) {
    this.currentBranch = branch;
  }

  /**
   * Get current branch
   */
  getCurrentBranch() {
    return this.currentBranch;
  }

  /**
   * Clear terminal output
   */
  clear() {
    this.output.innerHTML = '';
  }

  /**
   * Focus input
   */
  focus() {
    this.input.focus();
  }

  /**
   * Set input value
   */
  setInput(value) {
    this.input.value = value;
  }

  /**
   * Get input value
   */
  getInput() {
    return this.input.value;
  }
}
