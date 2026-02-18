// GitHub OS - File Editor

import { getAccessToken, isAuthenticated } from './session.js';
import { stageUpdate } from './staging.js';

let currentEditorState = null;

/**
 * Open file editor modal
 * @param {Object} options - Editor options
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @param {string} options.path - File path
 * @param {string} options.content - File content
 * @param {string} options.sha - File SHA for update
 * @param {Object} options.terminal - Terminal instance for messages
 */
export function openEditor({ owner, repo, path, content, sha, terminal }) {
  if (currentEditorState) {
    closeModal(false);
  }

  currentEditorState = {
    owner,
    repo,
    path,
    sha,
    terminal,
    originalContent: content
  };

  const modal = createEditorModal(path, content);
  document.body.appendChild(modal);
  
  const textarea = modal.querySelector('#editor-textarea');
  textarea.focus();
}

/**
 * Create editor modal DOM element
 */
function createEditorModal(filePath, content) {
  const overlay = document.createElement('div');
  overlay.id = 'editor-overlay';
  overlay.className = 'editor-overlay';
  
  overlay.innerHTML = `
    <div class="editor-modal">
      <div class="editor-header">
        <span class="editor-filename">${escapeHtml(filePath)}</span>
        <div class="editor-actions">
          <button id="editor-save" class="editor-btn editor-btn-save">Save (Ctrl+S)</button>
          <button id="editor-cancel" class="editor-btn editor-btn-cancel">Cancel (ESC)</button>
        </div>
      </div>
      <div class="editor-body">
        <textarea id="editor-textarea" class="editor-textarea" spellcheck="false">${escapeHtml(content)}</textarea>
      </div>
    </div>
  `;
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal(false);
    }
  });
  
  const saveBtn = overlay.querySelector('#editor-save');
  const cancelBtn = overlay.querySelector('#editor-cancel');
  const textarea = overlay.querySelector('#editor-textarea');
  
  saveBtn.addEventListener('click', () => saveFile());
  cancelBtn.addEventListener('click', () => closeModal(false));
  
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal(false);
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
    }
  });
  
  return overlay;
}

/**
 * Close editor modal
 * @param {boolean} showSuccess - Whether to show success message
 */
export function closeModal(showSuccess = false) {
  const overlay = document.getElementById('editor-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  if (showSuccess && currentEditorState?.terminal) {
  }
  
  currentEditorState = null;
  
  const terminalInput = document.getElementById('command-input');
  if (terminalInput) {
    terminalInput.focus();
  }
}

/**
 * Save file to staging
 */
async function saveFile() {
  if (!currentEditorState) return;
  
  const { owner, repo, path, sha, terminal } = currentEditorState;
  const textarea = document.getElementById('editor-textarea');
  
  if (!textarea) return;
  
  const content = textarea.value;
  
  if (!isAuthenticated()) {
    terminal.print(`<span class="error">Login required. Use 'login' to connect.</span>`);
    return;
  }
  
  stageUpdate(owner, repo, path, content, sha);
  
  closeModal(true);
  terminal.print(`<span class="success">Staged: modified</span> ${path}`);
}

/**
 * Check if editor is currently open
 */
export function isEditorOpen() {
  return currentEditorState !== null;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
