// GitHub OS - Terminal UI

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
        
        if (cmdLine.trim()) {
          this.commandHistory.push(cmdLine);
          this.historyIndex = this.commandHistory.length;
          await this.onCommand(cmdLine);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.commandHistory[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.input.value = this.commandHistory[this.historyIndex];
        } else {
          this.historyIndex = this.commandHistory.length;
          this.input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Tab completion could be added here
      }
    });

    // Focus input on click
    this.terminal.addEventListener('click', () => {
      this.input.focus();
    });
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
    const line = document.createElement('div');
    line.className = 'line ' + className;
    line.innerHTML = text;
    this.output.appendChild(line);
    this.scrollToBottom();
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
    
    this.scrollToBottom();
  }

  /**
   * Scroll to bottom of terminal
   */
  scrollToBottom() {
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  /**
   * Update prompt based on current path
   */
  updatePrompt() {
    const pathDisplay = this.currentPath === '/' ? '~' : `~${this.currentPath}`;
    this.promptEl.textContent = `guest@github-os:${pathDisplay}$`;
  }

  /**
   * Set current path
   */
  setPath(path) {
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
}
