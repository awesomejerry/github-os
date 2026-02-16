// GitHub OS - Commands

import { fetchUserRepos, fetchRepoContents, fetchFileContent, repoExists, getRepoInfo, getCache, searchCode, fetchRepoCommits, fetchRepoBranches, fetchRepoTree, fetchRepoIssues } from './github.js';
import { getLanguageForFile, formatBytes, escapeHtml, formatRelativeDate, validatePattern, isValidGitHubUrl } from './utils.js';
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
  exit: cmdExit,
  // Phase 2 commands
  whoami: cmdWhoami,
  connect: cmdConnect,
  info: cmdInfo,
  readme: cmdReadme,
  head: cmdHead,
  tail: cmdTail,
  download: cmdDownload,
  // Phase 3 commands
  grep: cmdGrep,
  log: cmdLog,
  branch: cmdBranch,
  find: cmdFind,
  // Phase 4 commands
  issues: cmdIssues
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
 * 
 * Path structure:
 *   /                    → root (list all repos)
 *   /reponame            → root of a repo
 *   /reponame/path/file  → a file inside repo
 */
export function parsePath(githubUser, path) {
  const parts = path.replace(/^\/|\/$/g, '').split('/').filter(p => p);
  
  if (parts.length === 0) {
    // Root - list all repos
    return { owner: null, repo: null, path: '' };
  } else {
    // First part is always the repo name, rest is the path inside repo
    return { 
      owner: githubUser, 
      repo: parts[0], 
      path: parts.slice(1).join('/') 
    };
  }
}

/**
 * Get completions for tab completion
 */
export async function getCompletions(githubUser, currentPath, partial) {
  const parts = partial.split(' ');
  const lastPart = parts[parts.length - 1];
  
  // If no space yet, we're completing a command
  if (parts.length === 1) {
    const commands = ['help', 'ls', 'cd', 'pwd', 'cat', 'tree', 'clear', 'exit', 
                      'whoami', 'connect', 'info', 'readme', 'head', 'tail', 'download', 'grep', 'log', 'branch', 'find', 'issues'];
    const matches = commands.filter(cmd => cmd.startsWith(partial.toLowerCase()));
    return { matches, isCommand: true };
  }
  
  // Completing a path
  const partialPath = lastPart;
  const dirPath = partialPath.includes('/') 
    ? partialPath.substring(0, partialPath.lastIndexOf('/'))
    : '';
  const prefix = partialPath.includes('/')
    ? partialPath.substring(partialPath.lastIndexOf('/') + 1)
    : partialPath;
  
  const targetDir = dirPath ? resolvePath(currentPath, dirPath) : currentPath;
  const parsed = parsePath(githubUser, targetDir);
  
  try {
    let items = [];
    
    if (targetDir === '/') {
      // Complete from repo names
      const repos = await fetchUserRepos(githubUser);
      items = repos.map(r => r.name + '/');
    } else {
      // Complete from directory contents
      const contents = await fetchRepoContents(parsed.owner, parsed.repo, parsed.path);
      if (Array.isArray(contents)) {
        items = contents.map(item => item.name + (item.type === 'dir' ? '/' : ''));
      }
    }
    
    const matches = items.filter(item => 
      item.toLowerCase().startsWith(prefix.toLowerCase())
    );
    
    // Return matches with context for cycling
    return { 
      matches, 
      isCommand: false,
      baseCmd: parts.slice(0, -1).join(' '),
      dirPath,
      prefix
    };
  } catch {
    return { matches: [], isCommand: false };
  }
}

// Command implementations

function cmdHelp(terminal) {
  const help = `
<span class="success">Available Commands:</span>

 <span class="info">Navigation</span>
  <span class="info">ls</span> [path]        List directory contents
  <span class="info">cd</span> &lt;path&gt;        Change directory (use <span class="success">cd -</span> to go back)
  <span class="info">pwd</span>               Print working directory

 <span class="info">File Operations</span>
  <span class="info">cat</span> &lt;file&gt;        Display file contents
  <span class="info">head</span> &lt;file&gt; [n]   Display first n lines (default: 10)
  <span class="info">tail</span> &lt;file&gt; [n]   Display last n lines (default: 10)
  <span class="info">readme</span>            Display README.md in current directory
  <span class="info">grep</span> &lt;pattern&gt; [file]   Search for pattern (file or repo-wide)
  <span class="info">download</span> &lt;file&gt;  Download file to your computer

 <span class="info">Repository</span>
    <span class="info">tree</span> [path]       Display directory tree
    <span class="info">info</span>              Show repository details
    <span class="info">log</span> [count]       Show commit history (default: 10)
    <span class="info">branch</span>            List all branches (default marked with *)
    <span class="info">find</span> &lt;pattern&gt;    Find files by name pattern
    <span class="info">issues</span> [--closed|--all]   List repository issues (default: open)
    <span class="info">connect</span> &lt;user&gt;   Switch to different GitHub user
    <span class="info">whoami</span>            Show current GitHub user

 <span class="info">Other</span>
  <span class="info">clear</span>             Clear terminal screen
  <span class="info">help</span>              Show this help message
  <span class="info">exit</span>              Exit terminal

<span class="info">Tips:</span>
  - Press <span class="success">Tab</span> to auto-complete paths
  - Press <span class="success">↑/↓</span> to navigate command history
  - Use <span class="success">grep -i</span> for case-insensitive search
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

  // Handle cd - (go to previous directory)
  if (args[0] === '-') {
    const prevPath = terminal.getPreviousPath();
    if (!prevPath) {
      terminal.print(`<span class="error">No previous directory</span>`);
      return;
    }
    // Swap current and previous
    const current = terminal.getPath();
    terminal.setPath(prevPath);
    terminal.print(`<span class="info">${prevPath}</span>`);
    // Restore previous path for next cd -
    terminal.previousPath = current;
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

async function cmdHead(terminal, githubUser, args) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: head &lt;file&gt; [lines]</span>`);
    return;
  }

  const targetPath = resolvePath(terminal.getPath(), args[0]);
  const numLines = args[1] ? parseInt(args[1]) : 10;
  const parsed = parsePath(githubUser, targetPath);

  if (targetPath === '/' || parsed.path === '') {
    terminal.print(`<span class="error">Not a file</span>`);
    return;
  }

  try {
    const { content, name } = await fetchFileContent(parsed.owner, parsed.repo, parsed.path);
    const lines = content.split('\n').slice(0, numLines);
    const lang = getLanguageForFile(name, LANGUAGE_MAP);
    terminal.printCode(lines.join('\n'), lang);
    terminal.print(`<span class="info">Showing first ${Math.min(numLines, lines.length)} lines</span>`);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdTail(terminal, githubUser, args) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: tail &lt;file&gt; [lines]</span>`);
    return;
  }

  const targetPath = resolvePath(terminal.getPath(), args[0]);
  const numLines = args[1] ? parseInt(args[1]) : 10;
  const parsed = parsePath(githubUser, targetPath);

  if (targetPath === '/' || parsed.path === '') {
    terminal.print(`<span class="error">Not a file</span>`);
    return;
  }

  try {
    const { content, name } = await fetchFileContent(parsed.owner, parsed.repo, parsed.path);
    const lines = content.split('\n').slice(-numLines);
    const lang = getLanguageForFile(name, LANGUAGE_MAP);
    terminal.printCode(lines.join('\n'), lang);
    terminal.print(`<span class="info">Showing last ${lines.length} lines</span>`);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdReadme(terminal, githubUser, args) {
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  
  // Try common README files
  const readmeNames = ['README.md', 'readme.md', 'README', 'readme', 'README.txt'];
  
  for (const readmeName of readmeNames) {
    const readmePath = parsed.path ? `${parsed.path}/${readmeName}` : readmeName;
    try {
      const { content, name } = await fetchFileContent(parsed.owner, parsed.repo, readmePath);
      terminal.printCode(content, 'markdown');
      return;
    } catch {
      // Try next variant
      continue;
    }
  }
  
  terminal.print(`<span class="error">No README file found in current directory</span>`);
}

async function cmdDownload(terminal, githubUser, args) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: download &lt;file&gt;</span>`);
    return;
  }

  const targetPath = resolvePath(terminal.getPath(), args[0]);
  const parsed = parsePath(githubUser, targetPath);

  if (targetPath === '/' || parsed.path === '') {
    terminal.print(`<span class="error">Not a file</span>`);
    return;
  }

  try {
    // Get the download URL from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${parsed.path}`
    );
    
    if (!response.ok) throw new Error('File not found');
    
    const file = await response.json();
    
    if (file.type !== 'file') throw new Error('Not a file');
    
    // Security: Validate download URL is from GitHub
    const downloadUrl = file.download_url;
    if (!isValidGitHubUrl(downloadUrl)) {
      throw new Error('Invalid download URL - security check failed');
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    terminal.print(`<span class="success">Downloading: ${escapeHtml(file.name)}</span>`);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${escapeHtml(error.message)}</span>`);
  }
}

async function cmdInfo(terminal, githubUser, args) {
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  
  try {
    const info = await getRepoInfo(parsed.owner, parsed.repo);
    
    terminal.print('');
    terminal.print(`<span class="success">${info.full_name}</span>`);
    if (info.description) {
      terminal.print(`<span class="info">${info.description}</span>`);
    }
    terminal.print('');
    terminal.print(`<span class="info">Language:</span>  ${info.language || 'N/A'}`);
    terminal.print(`<span class="info">Stars:</span>     ★ ${info.stars}`);
    terminal.print(`<span class="info">Forks:</span>     ${info.forks}`);
    terminal.print(`<span class="info">Watchers:</span>  ${info.watchers}`);
    terminal.print(`<span class="info">License:</span>   ${info.license}`);
    if (info.topics.length > 0) {
      terminal.print(`<span class="info">Topics:</span>    ${info.topics.join(', ')}`);
    }
    if (info.homepage) {
      terminal.print(`<span class="info">Homepage:</span>  ${info.homepage}`);
    }
    terminal.print('');
    terminal.print(`<span class="info">URL:</span> ${info.html_url}`);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

function cmdWhoami(terminal, githubUser) {
  terminal.print(`<span class="info">GitHub user:</span> <span class="success">${githubUser}</span>`);
}

async function cmdConnect(terminal, githubUser, args, app) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: connect &lt;github-username&gt;</span>`);
    return;
  }

  const newUser = args[0];
  
  try {
    // Verify the user exists by fetching repos
    terminal.print(`<span class="info">Connecting to ${newUser}...</span>`);
    const repos = await fetchUserRepos(newUser);
    
    // Update the app's github user
    if (app && app.setGithubUser) {
      app.setGithubUser(newUser);
    }
    
    // Reset to root
    terminal.setPath('/');
    
    terminal.print(`<span class="success">Connected to ${newUser} (${repos.length} repositories)</span>`);
  } catch (error) {
    terminal.print(`<span class="error">Error: Could not connect to ${newUser}. User may not exist.</span>`);
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

async function cmdGrep(terminal, githubUser, args) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: grep &lt;pattern&gt; [file]</span>`);
    terminal.print(`<span class="info">Examples:</span>`);
    terminal.print(`  grep "export" app.js      Search in app.js`);
    terminal.print(`  grep "function"           Search entire repo (GitHub API)`);
    return;
  }

  const pattern = args[0];
  
  // Security: Validate pattern to prevent ReDoS
  const validation = validatePattern(pattern, 100);
  if (!validation.valid) {
    terminal.print(`<span class="error">Invalid pattern: ${validation.error}</span>`);
    return;
  }
  
  const caseInsensitive = args.includes('-i');
  const filePath = args.find(a => !a.startsWith('-') && a !== pattern);

  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);

  try {
    if (filePath) {
      // Single file grep
      const targetPath = resolvePath(currentPath, filePath);
      const fileParsed = parsePath(githubUser, targetPath);

      if (!fileParsed.path) {
        terminal.print(`<span class="error">Please specify a file, not a directory.</span>`);
        return;
      }

      const { content, name } = await fetchFileContent(fileParsed.owner, fileParsed.repo, fileParsed.path);
      const lines = content.split('\n');
      
      const regex = new RegExp(pattern, caseInsensitive ? 'gi' : 'g');
      const matches = [];
      
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          matches.push({
            line: index + 1,
            content: line.trim()
          });
        }
        // Reset regex lastIndex for global flag
        regex.lastIndex = 0;
      });

      if (matches.length === 0) {
        terminal.print(`<span class="info">No matches found.</span>`);
        return;
      }

      terminal.print(`<span class="success">${name}</span>`);
      matches.forEach(m => {
        const highlighted = m.content.replace(
          new RegExp(`(${escapeRegex(pattern)})`, caseInsensitive ? 'gi' : 'g'),
          '<span class="error">$1</span>'
        );
        terminal.print(`<span class="info">${m.line}:</span> ${highlighted}`);
      });
      terminal.print(`<span class="info">${matches.length} match(es)</span>`);

    } else {
      // Repo-wide search using GitHub API
      terminal.print(`<span class="info">Searching repository for "${pattern}"...</span>`);
      
      const searchPath = parsed.path || undefined;
      const results = await searchCode(parsed.owner, parsed.repo, pattern, searchPath);

      if (results.length === 0) {
        terminal.print(`<span class="info">No matches found.</span>`);
        return;
      }

      terminal.print(`<span class="success">Found ${results.length} file(s):</span>\n`);
      results.forEach(item => {
        terminal.print(`  <span class="file">${item.path}</span>`);
      });
      terminal.print(`\n<span class="info">Tip: Use 'grep "${pattern}" &lt;file&gt;' to see line matches.</span>`);
    }
  } catch (error) {
    if (error.message === 'REQUIRE_AUTH') {
      // GitHub code search requires authentication
      const searchUrl = `https://github.com/${parsed.owner}/${parsed.repo}/search?q=${encodeURIComponent(pattern)}`;
      terminal.print(`<span class="error">Repo-wide search requires GitHub authentication.</span>`);
      terminal.print(`<span class="info">Try single-file search: grep "${pattern}" &lt;file&gt;</span>`);
      terminal.print(`<span class="info">Or search on GitHub:</span>`);
      terminal.print(`  <a href="${searchUrl}" target="_blank" class="directory">${searchUrl}</a>`);
    } else {
      terminal.print(`<span class="error">Error: ${error.message}</span>`);
    }
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function cmdLog(terminal, githubUser, args) {
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  const count = args[0] ? parseInt(args[0]) : 10;
  
  if (isNaN(count) || count < 1) {
    terminal.print(`<span class="error">Invalid count. Usage: log [count]</span>`);
    return;
  }

  try {
    const commits = await fetchRepoCommits(parsed.owner, parsed.repo, count);
    
    if (commits.length === 0) {
      terminal.print(`<span class="info">No commits yet</span>`);
      return;
    }
    
    terminal.print('');
    commits.forEach(commit => {
      const relativeDate = formatRelativeDate(commit.date);
      terminal.print(`<span class="success">${commit.sha}</span> <span class="info">${commit.author}</span> <span class="info">(${relativeDate})</span>`);
      terminal.print(`    ${escapeHtml(commit.message)}`);
    });
    terminal.print(`\n<span class="info">${commits.length} commit(s)</span>`);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdBranch(terminal, githubUser, args) {
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);

  try {
    const [branches, repoInfo] = await Promise.all([
      fetchRepoBranches(parsed.owner, parsed.repo),
      getRepoInfo(parsed.owner, parsed.repo)
    ]);
    
    if (branches.length === 0) {
      terminal.print(`<span class="info">No branches found</span>`);
      return;
    }
    
    terminal.print('');
    branches.forEach(branch => {
      const isDefault = branch.name === repoInfo.default_branch;
      const prefix = isDefault ? '* ' : '  ';
      const className = isDefault ? 'success' : 'directory';
      terminal.print(`${prefix}<span class="${className}">${branch.name}</span>`);
    });
    terminal.print(`\n<span class="info">${branches.length} branch(es)</span>`);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdFind(terminal, githubUser, args) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: find &lt;pattern&gt;</span>`);
    terminal.print(`<span class="info">Examples:</span>`);
    terminal.print(`  find *.js        Find all JavaScript files`);
    terminal.print(`  find test        Find files containing "test"`);
    terminal.print(`  find README      Find all README files`);
    return;
  }

  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  const pattern = args[0];

  try {
    const repoInfo = await getRepoInfo(parsed.owner, parsed.repo);
    terminal.print(`<span class="info">Searching for "${pattern}"...</span>`);
    
    const files = await fetchRepoTree(parsed.owner, parsed.repo, repoInfo.default_branch);
    
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(regexPattern, 'i');
    const matches = files.filter(file => regex.test(file.path));
    
    if (matches.length === 0) {
      terminal.print(`<span class="info">No files found matching "${pattern}"</span>`);
      return;
    }
    
    terminal.print('');
    matches.forEach(file => {
      terminal.print(`  <span class="file">${file.path}</span>`);
    });
    terminal.print(`\n<span class="info">${matches.length} file(s) found</span>`);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdIssues(terminal, githubUser, args) {
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  
  const showAll = args.includes('--all');
  const showClosed = args.includes('--closed');
  const state = showAll ? 'all' : (showClosed ? 'closed' : 'open');

  try {
    const issues = await fetchRepoIssues(parsed.owner, parsed.repo, state);
    
    if (issues.length === 0) {
      const stateDesc = showAll ? '' : (showClosed ? 'closed ' : 'open ');
      terminal.print(`<span class="info">No ${stateDesc}issues found</span>`);
      return;
    }
    
    terminal.print('');
    issues.forEach(issue => {
      const labels = issue.labels.length > 0 
        ? ` <span class="info">[${issue.labels.join(', ')}]</span>` 
        : '';
      const relativeDate = formatRelativeDate(issue.created_at);
      terminal.print(`<span class="success">#${issue.number}</span> ${escapeHtml(issue.title)} <span class="info">@${issue.author}</span>${labels} <span class="info">(${relativeDate})</span>`);
    });
    terminal.print(`\n<span class="info">${issues.length} issue(s)</span>`);
  } catch (error) {
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}
