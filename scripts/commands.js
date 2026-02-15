// GitHub OS - Commands

import { fetchUserRepos, fetchRepoContents, fetchFileContent, repoExists } from './github.js';
import { getLanguageForFile, formatBytes, escapeHtml } from './utils.js';
import { LANGUAGE_MAP } from './config.js';

/**
 * Command registry - maps command names to functions
 */
export const commands = {
  help: cmdHelp,
  ls: cmdLs,
  cd: cmdCd,
  pwd: cmdPwd,
  cat: cmdCat,
  tree: cmdTree,
  clear: cmdClear,
  exit: cmdExit
};

/**
 * Parse path relative to current directory
 */
export function resolvePath(currentPath, path) {
  if (path.startsWith('/')) {
    return path;
  }
  
  const current = currentPath === '/' ? '' : currentPath;
  let resolved = (current + '/' + path).replace(/\/+/g, '/');
  
  // Handle . and ..
  const parts = resolved.split('/').filter(p => p);
  const result = [];
  
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      result.pop();
    } else {
      result.push(part);
    }
  }
  
  return '/' + result.join('/');
}

/**
 * Parse path into owner, repo, and internal path
 */
export function parsePath(githubUser, path) {
  const parts = path.replace(/^\/|\/$/g, '').split('/').filter(p => p);
  
  if (parts.length === 0) {
    return { owner: null, repo: null, path: '' };
  } else if (parts.length === 1) {
    return { owner: githubUser, repo: parts[0], path: '' };
  } else {
    return { owner: githubUser, repo: parts[1], path: parts.slice(2).join('/') };
  }
}

// Command implementations

function cmdHelp(terminal) {
  const help = `
<span class="success">Available Commands:</span>

  <span class="info">ls</span> [path]        List directory contents
  <span class="info">cd</span> &lt;path&gt;        Change directory
  <span class="info">pwd</span>               Print working directory
  <span class="info">cat</span> &lt;file&gt;        Display file contents
  <span class="info">tree</span> [path]       Display directory tree
  <span class="info">clear</span>             Clear terminal screen
  <span class="info">help</span>              Show this help message
  <span class="info">exit</span>              Exit terminal

<span class="info">Tips:</span>
  - Use <span class="success">cd ..</span> to go up one directory
  - Use <span class="success">cd /</span> to go to root (repository list)
  - Press <span class="success">↑/↓</span> to navigate command history
`;
  terminal.print(help);
}

async function cmdLs(terminal, githubUser, args) {
  const targetPath = args[0] ? resolvePath(terminal.getPath(), args[0]) : terminal.getPath();
  const parsed = parsePath(githubUser, targetPath);

  try {
    if (targetPath === '/') {
      // List repositories
      const repos = await fetchUserRepos(githubUser);
      
      terminal.print('');
      repos.forEach(repo => {
        const lang = repo.language ? ` [<span class="info">${repo.language}</span>]` : '';
        const stars = repo.stars > 0 ? ` <span class="success">★${repo.stars}</span>` : '';
        terminal.print(`<span class="directory">${repo.name}/</span>${lang}${stars}`);
        if (repo.description) {
          terminal.print(`  <span class="info">${repo.description}</span>`);
        }
      });
      terminal.print(`\n<span class="info">${repos.length} repositories</span>`);
    } else {
      // List repo contents
      const contents = await fetchRepoContents(parsed.owner, parsed.repo, parsed.path);
      
      if (!Array.isArray(contents)) {
        terminal.print(`<span class="error">Not a directory</span>`);
        return;
      }
      
      terminal.print('');
      contents.forEach(item => {
        if (item.type === 'dir') {
          terminal.print(`<span class="directory">${item.name}/</span>`);
        } else {
          const size = item.size ? ` <span class="info">(${formatBytes(item.size)})</span>` : '';
          terminal.print(`<span class="file">${item.name}</span>${size}`);
        }
      });
      terminal.print(`\n<span class="info">${contents.length} items</span>`);
    }
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdCd(terminal, githubUser, args) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: cd &lt;directory&gt;</span>`);
    return;
  }

  const targetPath = resolvePath(terminal.getPath(), args[0]);
  const parsed = parsePath(githubUser, targetPath);

  try {
    if (targetPath === '/') {
      terminal.setPath('/');
      return;
    }

    // Validate the path exists
    if (parsed.path === '') {
      // Navigating to a repo, check if it exists
      const exists = await repoExists(parsed.owner, parsed.repo);
      if (!exists) {
        terminal.print(`<span class="error">Repository not found: ${parsed.repo}</span>`);
        return;
      }
    } else {
      // Check if directory exists
      await fetchRepoContents(parsed.owner, parsed.repo, parsed.path);
    }

    terminal.setPath(targetPath);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

function cmdPwd(terminal) {
  const path = terminal.getPath();
  terminal.print(path === '/' ? '/' : path);
}

async function cmdCat(terminal, githubUser, args) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: cat &lt;file&gt;</span>`);
    return;
  }

  const targetPath = resolvePath(terminal.getPath(), args[0]);
  const parsed = parsePath(githubUser, targetPath);

  if (targetPath === '/' || parsed.path === '') {
    terminal.print(`<span class="error">Not a file</span>`);
    return;
  }

  try {
    const { content, name } = await fetchFileContent(parsed.owner, parsed.repo, parsed.path);
    const lang = getLanguageForFile(name, LANGUAGE_MAP);
    terminal.printCode(content, lang);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdTree(terminal, githubUser, args) {
  const targetPath = args[0] ? resolvePath(terminal.getPath(), args[0]) : terminal.getPath();
  const parsed = parsePath(githubUser, targetPath);

  if (targetPath === '/') {
    terminal.print(`<span class="info">Repository listing (use 'ls' to see details):</span>\n`);
    const repos = await fetchUserRepos(githubUser);
    repos.forEach(repo => {
      terminal.print(`<span class="directory">${repo.name}/</span>`);
    });
    return;
  }

  terminal.print(`<span class="info">Loading directory tree...</span>`);
  await printTreeRecursive(terminal, githubUser, parsed.owner, parsed.repo, parsed.path, '', 0);
}

async function printTreeRecursive(terminal, githubUser, owner, repo, path, prefix, depth) {
  if (depth > 3) {
    terminal.print(`${prefix}<span class="info">...</span>`);
    return;
  }

  try {
    const contents = await fetchRepoContents(owner, repo, path);
    
    if (!Array.isArray(contents)) return;

    for (let i = 0; i < contents.length; i++) {
      const item = contents[i];
      const isLastItem = i === contents.length - 1;
      const connector = isLastItem ? '└── ' : '├── ';
      const newPrefix = prefix + (isLastItem ? '    ' : '│   ');

      if (item.type === 'dir') {
        terminal.print(`${prefix}${connector}<span class="directory">${item.name}/</span>`);
        await printTreeRecursive(terminal, githubUser, owner, repo, path ? `${path}/${item.name}` : item.name, newPrefix, depth + 1);
      } else {
        terminal.print(`${prefix}${connector}<span class="file">${item.name}</span>`);
      }
    }
  } catch (error) {
    terminal.print(`${prefix}<span class="error">Error loading: ${error.message}</span>`);
  }
}

function cmdClear(terminal) {
  terminal.clear();
}

function cmdExit(terminal) {
  terminal.print(`<span class="info">Goodbye!</span>`);
}
