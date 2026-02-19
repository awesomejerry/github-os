// GitHub OS - Commands

import { fetchUserRepos, fetchRepoContents, fetchFileContent, repoExists, getRepoInfo, getCache, searchCode, fetchRepoCommits, fetchRepoBranches, fetchRepoTree, fetchRepoIssues, fetchRepoPRs, fetchRepoPR, fetchRepoContributors, fetchRepoReleases, getFile, createFile, deleteFile, checkFileExists, getDefaultBranchSHA, createBranch, deleteBranch, clearBranchCache, batchCommit } from './github.js';
import { getLanguageForFile, formatBytes, escapeHtml, formatRelativeDate, validatePattern, isValidGitHubUrl } from './utils.js';
import { LANGUAGE_MAP, DEFAULT_GITHUB_USER } from './config.js';
import { openEditor } from './editor.js';
import { getStagedChanges, stageCreate, stageUpdate, stageDelete, clearStaging, hasStagedChanges } from './staging.js';

let auth, session;

try {
  auth = await import('./auth.js');
} catch {
  auth = {
    initiateLogin: () => {
      throw new Error('Auth module not available. Please wait for auth-oauth implementation.');
    }
  };
}

try {
  session = await import('./session.js');
} catch {
  session = {
    loadSession: () => null,
    clearSession: () => {},
    isAuthenticated: () => false,
    getAccessToken: () => null
  };
}

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
  issues: cmdIssues,
  pr: cmdPr,
  contributors: cmdContributors,
  releases: cmdReleases,
  // Auth commands
  login: cmdLogin,
  logout: cmdLogout,
  status: cmdStatus,
  // File operations (write)
  touch: cmdTouch,
  mkdir: cmdMkdir,
  rm: cmdRm,
  mv: cmdMv,
  cp: cmdCp,
  edit: cmdEdit,
  checkout: cmdCheckout,
  // Staging commands
  add: cmdAdd,
  diff: cmdDiff,
  commit: cmdCommit
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
                      'whoami', 'connect', 'info', 'readme', 'head', 'tail', 'download', 'grep', 'log', 'branch', 'find', 'issues', 'pr', 'contributors', 'releases', 'login', 'logout', 'status', 'touch', 'mkdir', 'rm', 'mv', 'cp', 'edit', 'add', 'diff', 'commit'];
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

 <span class="info">File Operations (Read)</span>
  <span class="info">cat</span> &lt;file&gt;        Display file contents
  <span class="info">head</span> &lt;file&gt; [n]   Display first n lines (default: 10)
  <span class="info">tail</span> &lt;file&gt; [n]   Display last n lines (default: 10)
  <span class="info">readme</span>            Display README.md in current directory
  <span class="info">grep</span> &lt;pattern&gt; [file]   Search for pattern (file or repo-wide)
  <span class="info">download</span> &lt;file&gt;  Download file to your computer
  <span class="info">edit</span> &lt;file&gt;       Edit file and save to GitHub

 <span class="info">File Operations (Write - requires login)</span>
  <span class="info">touch</span> &lt;file&gt;      Create new file
  <span class="info">mkdir</span> &lt;dir&gt;       Create directory
  <span class="info">rm</span> &lt;file&gt;         Delete file (with confirmation)
  <span class="info">mv</span> &lt;src&gt; &lt;dest&gt;   Move/rename file
  <span class="info">cp</span> &lt;src&gt; &lt;dest&gt;   Copy file

 <span class="info">Staging (Batch Commit)</span>
  <span class="info">add</span> &lt;file&gt;        Stage file changes for commit
  <span class="info">diff</span>              Show staged changes
  <span class="info">commit</span> -m "msg"   Commit staged changes

 <span class="info">Repository</span>
    <span class="info">tree</span> [path]       Display directory tree
    <span class="info">info</span>              Show repository details
    <span class="info">log</span> [count]       Show commit history (default: 10)
    <span class="info">branch</span>            List all branches (default marked with *)
    <span class="info">branch -c &lt;name&gt;</span>  Create new branch (requires login)
    <span class="info">branch -d &lt;name&gt;</span>  Delete branch (requires login)
    <span class="info">checkout &lt;branch&gt;</span> Switch to branch
    <span class="info">find</span> &lt;pattern&gt;    Find files by name pattern
    <span class="info">issues</span> [--closed|--all]   List repository issues (default: open)
    <span class="info">pr</span> [--all]         List repository pull requests (default: open)
    <span class="info">pr view</span> &lt;number&gt;  View pull request details
    <span class="info">releases</span> [count]  List repository releases (default: 10)
    <span class="info">contributors</span> [count]     List repository contributors (default: 20)
    <span class="info">connect</span> &lt;user&gt;   Switch to different GitHub user
    <span class="info">whoami</span>            Show current GitHub user

 <span class="info">Authentication</span>
    <span class="info">login</span>             Connect to GitHub with OAuth
    <span class="info">logout</span>            Disconnect from GitHub
    <span class="info">status</span>            Show authentication status and rate limits

 <span class="info">Other</span>
  <span class="info">clear</span>             Clear terminal screen
  <span class="info">help</span>              Show this help message
  <span class="info">exit</span>              Exit terminal

<span class="info">Tips:</span>
  - Press <span class="success">Tab</span> to auto-complete paths
  - Press <span class="success">↑/↓</span> to navigate command history
  - Use <span class="success">grep -i</span> for case-insensitive search
  - Use <span class="success">add</span> + <span class="success">commit</span> for batch commits
`;
  terminal.print(help);
}

async function cmdLs(terminal, githubUser, args) {
  const targetPath = args[0] ? resolvePath(terminal.getPath(), args[0]) : terminal.getPath();
  const parsed = parsePath(githubUser, targetPath);

  terminal.showLoading();
  try {
    if (targetPath === '/') {
      // List repositories
      const repos = await fetchUserRepos(githubUser);
      
      terminal.hideLoading();
      terminal.print('');
      repos.forEach(repo => {
        const lock = repo.private ? '🔒 ' : '';
        const lang = repo.language ? ` [<span class="info">${repo.language}</span>]` : '';
        const stars = repo.stars > 0 ? ` <span class="success">★${repo.stars}</span>` : '';
        terminal.print(`${lock}<span class="directory">${repo.name}/</span>${lang}${stars}`);
        if (repo.description) {
          terminal.print(`  <span class="info">${repo.description}</span>`);
        }
      });
      terminal.print(`\n<span class="info">${repos.length} repositories</span>`);
    } else {
      // List repo contents
      const contents = await fetchRepoContents(parsed.owner, parsed.repo, parsed.path);
      
      terminal.hideLoading();
      
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
    terminal.hideLoading();
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
      // Check if path exists and is a directory
      const contents = await fetchRepoContents(parsed.owner, parsed.repo, parsed.path);
      
      // GitHub API returns array for directories, object for files
      // File objects have type: 'file' property
      const isFile = !Array.isArray(contents) || contents.type === 'file';
      if (isFile) {
        terminal.print(`<span class="error">Not a directory: ${args[0]}</span>`);
        return;
      }
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

  terminal.showLoading();
  try {
    const { content, name } = await fetchFileContent(parsed.owner, parsed.repo, parsed.path);
    terminal.hideLoading();
    const lang = getLanguageForFile(name, LANGUAGE_MAP);
    terminal.printCode(content, lang);
  } catch (error) {
    terminal.hideLoading();
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
  
  terminal.showLoading();
  try {
    const info = await getRepoInfo(parsed.owner, parsed.repo);
    terminal.hideLoading();
    
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
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

function cmdWhoami(terminal, githubUser) {
  const currentSession = session.loadSession();
  
  if (currentSession && currentSession.username) {
    terminal.print(`<span class="info">GitHub user:</span> <span class="success">${currentSession.username}</span> <span class="info">(logged in)</span>`);
  } else {
    terminal.print(`<span class="info">GitHub user:</span> <span class="success">${githubUser}</span> <span class="info">(default, not logged in)</span>`);
  }
}

async function cmdConnect(terminal, githubUser, args, app) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: connect &lt;github-username&gt;</span>`);
    return;
  }

  const newUser = args[0];
  
  terminal.showLoading(`Connecting to ${newUser}...`);
  try {
    // Verify the user exists by fetching repos
    const repos = await fetchUserRepos(newUser);
    terminal.hideLoading();
    
    // Update the app's github user
    if (app && app.setGithubUser) {
      app.setGithubUser(newUser);
    }
    
    // Reset to root
    terminal.setPath('/');
    
    terminal.print(`<span class="success">Connected to ${newUser} (${repos.length} repositories)</span>`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: Could not connect to ${newUser}. User may not exist.</span>`);
  }
}

async function cmdTree(terminal, githubUser, args) {
  const targetPath = args[0] ? resolvePath(terminal.getPath(), args[0]) : terminal.getPath();
  const parsed = parsePath(githubUser, targetPath);

  terminal.showLoading();
  
  if (targetPath === '/') {
    terminal.hideLoading();
    terminal.print(`<span class="info">Repository listing (use 'ls' to see details):</span>\n`);
    const repos = await fetchUserRepos(githubUser);
    repos.forEach(repo => {
      terminal.print(`<span class="directory">${repo.name}/</span>`);
    });
    return;
  }

  await printTreeRecursive(terminal, githubUser, parsed.owner, parsed.repo, parsed.path, '', 0);
  terminal.hideLoading();
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

  terminal.showLoading(filePath ? undefined : `Searching for "${pattern}"...`);
  try {
    if (filePath) {
      // Single file grep
      const targetPath = resolvePath(currentPath, filePath);
      const fileParsed = parsePath(githubUser, targetPath);

      if (!fileParsed.path) {
        terminal.hideLoading();
        terminal.print(`<span class="error">Please specify a file, not a directory.</span>`);
        return;
      }

      const { content, name } = await fetchFileContent(fileParsed.owner, fileParsed.repo, fileParsed.path);
      terminal.hideLoading();
      
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
      const searchPath = parsed.path || undefined;
      const results = await searchCode(parsed.owner, parsed.repo, pattern, searchPath);
      terminal.hideLoading();

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
    terminal.hideLoading();
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

  terminal.showLoading();
  try {
    const commits = await fetchRepoCommits(parsed.owner, parsed.repo, count);
    terminal.hideLoading();
    
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
    terminal.hideLoading();
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

  terminal.showLoading(`Searching for "${pattern}"...`);
  try {
    const repoInfo = await getRepoInfo(parsed.owner, parsed.repo);
    const files = await fetchRepoTree(parsed.owner, parsed.repo, repoInfo.default_branch);
    
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(regexPattern, 'i');
    const matches = files.filter(file => regex.test(file.path));
    
    terminal.hideLoading();
    
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
    terminal.hideLoading();
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

  terminal.showLoading();
  try {
    const issues = await fetchRepoIssues(parsed.owner, parsed.repo, state);
    terminal.hideLoading();
    
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
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdPr(terminal, githubUser, args) {
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  
  if (args[0] === 'view' && args[1]) {
    const prNumber = parseInt(args[1]);
    if (isNaN(prNumber)) {
      terminal.print(`<span class="error">Invalid PR number: ${args[1]}</span>`);
      return;
    }
    
    terminal.showLoading();
    try {
      const pr = await fetchRepoPR(parsed.owner, parsed.repo, prNumber);
      terminal.hideLoading();
      
      let stateDisplay = pr.state;
      if (pr.merged) {
        stateDisplay = 'merged';
      }
      const draftIndicator = pr.draft ? ' <span class="warning">[draft]</span>' : '';
      
      terminal.print('');
      terminal.print(`<span class="success">#${pr.number}</span> ${escapeHtml(pr.title)}${draftIndicator}`);
      terminal.print(`<span class="info">State:</span>    ${stateDisplay}`);
      terminal.print(`<span class="info">Author:</span>   @${pr.author}`);
      terminal.print(`<span class="info">Branch:</span>   ${pr.head_branch} → ${pr.base_branch}`);
      
      const relativeDate = formatRelativeDate(pr.created_at);
      terminal.print(`<span class="info">Created:</span>  ${relativeDate}`);
      
      if (pr.changed_files > 0) {
        terminal.print(`<span class="info">Changes:</span>  +${pr.additions} -${pr.deletions} in ${pr.changed_files} file(s)`);
      }
      
      if (pr.labels.length > 0) {
        terminal.print(`<span class="info">Labels:</span>   ${pr.labels.join(', ')}`);
      }
      
      if (pr.body) {
        const truncatedBody = pr.body.length > 500 ? pr.body.substring(0, 500) + '...' : pr.body;
        terminal.print('');
        terminal.print(`<span class="info">Description:</span>`);
        terminal.print(truncatedBody.split('\n').map(line => `  ${escapeHtml(line)}`).join('\n'));
      }
      
      terminal.print('');
      terminal.print(`<span class="info">URL:</span> ${pr.html_url}`);
    } catch (error) {
      terminal.hideLoading();
      terminal.print(`<span class="error">Error: ${error.message}</span>`);
    }
    return;
  }
  
  const showAll = args.includes('--all');
  const state = showAll ? 'all' : 'open';

  terminal.showLoading();
  try {
    const prs = await fetchRepoPRs(parsed.owner, parsed.repo, state);
    terminal.hideLoading();
    
    if (prs.length === 0) {
      const stateDesc = showAll ? '' : 'open ';
      terminal.print(`<span class="info">No ${stateDesc}pull requests found</span>`);
      return;
    }
    
    terminal.print('');
    prs.forEach(pr => {
      const labels = pr.labels.length > 0 
        ? ` <span class="info">[${pr.labels.join(', ')}]</span>` 
        : '';
      const draftIndicator = pr.draft ? ' <span class="warning">[draft]</span>' : '';
      const relativeDate = formatRelativeDate(pr.created_at);
      terminal.print(`<span class="success">#${pr.number}</span> ${escapeHtml(pr.title)}${draftIndicator} <span class="info">@${pr.author}</span>${labels} <span class="info">(${relativeDate})</span>`);
    });
    terminal.print(`\n<span class="info">${prs.length} pull request(s)</span>`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdContributors(terminal, githubUser, args) {
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  const count = args[0] ? parseInt(args[0]) : 20;
  
  if (isNaN(count) || count < 1) {
    terminal.print(`<span class="error">Invalid count. Usage: contributors [count]</span>`);
    return;
  }

  terminal.showLoading();
  try {
    const contributors = await fetchRepoContributors(parsed.owner, parsed.repo, count);
    terminal.hideLoading();
    
    if (contributors.length === 0) {
      terminal.print(`<span class="info">No contributors found</span>`);
      return;
    }
    
    terminal.print('');
    contributors.forEach(contributor => {
      terminal.print(`👤 <span class="info">@${contributor.login}</span>  <span class="success">${contributor.contributions}</span> contributions`);
    });
    terminal.print(`\n<span class="info">${contributors.length} contributor(s)</span>`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdReleases(terminal, githubUser, args) {
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  const count = args[0] ? parseInt(args[0]) : 10;
  
  if (isNaN(count) || count < 1) {
    terminal.print(`<span class="error">Invalid count. Usage: releases [count]</span>`);
    return;
  }

  terminal.showLoading();
  try {
    const releases = await fetchRepoReleases(parsed.owner, parsed.repo, count);
    terminal.hideLoading();
    
    if (releases.length === 0) {
      terminal.print(`<span class="info">No releases found</span>`);
      return;
    }
    
    terminal.print('');
    releases.forEach(release => {
      const prerelease = release.prerelease 
        ? ` <span class="warning">[pre-release]</span>` 
        : '';
      const relativeDate = formatRelativeDate(release.published_at);
      terminal.print(`<span class="success">${release.tag_name}</span> ${escapeHtml(release.name)} <span class="info">@${release.author}</span> <span class="info">(${relativeDate})</span>${prerelease}`);
    });
    terminal.print(`\n<span class="info">${releases.length} release(s)</span>`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdLogin(terminal) {
  terminal.print(`<span class="info">Opening GitHub login...</span>`);
  
  try {
    await auth.initiateLogin();
  } catch (error) {
    terminal.print(`<span class="error">Login failed: ${escapeHtml(error.message)}</span>`);
  }
}

function cmdLogout(terminal) {
  const currentSession = session.loadSession();
  
  if (currentSession && currentSession.username) {
    const username = currentSession.username;
    session.clearSession();
    
    // Clear API cache to ensure fresh data
    import('./github.js').then(m => m.clearCache?.());
    
    // Update prompt to show guest
    terminal.updatePrompt();
    
    terminal.print(`<span class="success">Logged out from ${username}</span>`);
  } else {
    terminal.print(`<span class="info">No active session</span>`);
  }
}

async function cmdStatus(terminal) {
  const currentSession = session.loadSession();
  
  // Show auth status
  if (currentSession && currentSession.username) {
    terminal.print(`<span class="info">Logged in as:</span> <span class="success">${currentSession.username}</span>`);
    terminal.print(`<span class="info">Token scope:</span> ${currentSession.scope || 'N/A'}`);
    
    try {
      const token = session.getAccessToken();
      if (token) {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const limit = response.headers.get('x-ratelimit-limit');
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');
        
        if (limit && remaining && reset) {
          const resetDate = new Date(parseInt(reset) * 1000);
          const now = new Date();
          const diffMs = resetDate - now;
          const diffMins = Math.round(diffMs / 60000);
          
          const resetText = diffMins > 60 
            ? `${Math.round(diffMins / 60)} hours` 
            : `${diffMins} min`;
          
          terminal.print(`<span class="info">Rate limit:</span> ${remaining}/${limit} <span class="info">(resets in ${resetText})</span>`);
        }
      }
    } catch (error) {
      terminal.print(`<span class="info">Rate limit:</span> Unable to fetch`);
    }
  } else {
    terminal.print(`<span class="info">Not logged in. Use 'login' to connect.</span>`);
  }
  
  // Show staged changes
  terminal.print('');
  if (hasStagedChanges()) {
    const changes = getStagedChanges();
    terminal.print(`<span class="success">Staged changes:</span>`);
    
    changes.creates.forEach(c => {
      terminal.print(`  <span class="success">new file:</span>   ${c.path}`);
    });
    changes.updates.forEach(u => {
      terminal.print(`  <span class="warning">modified:</span>  ${u.path}`);
    });
    changes.deletes.forEach(d => {
      terminal.print(`  <span class="error">deleted:</span>   ${d.path}`);
    });
    
    const total = changes.creates.length + changes.updates.length + changes.deletes.length;
    terminal.print(`<span class="info">${total} change(s) staged. Use 'commit -m "..."' to commit.</span>`);
  } else {
    terminal.print(`<span class="info">No staged changes.</span>`);
  }
}

async function cmdTouch(terminal, githubUser, args) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Authentication required. Use 'login' to connect.</span>`);
    return;
  }

  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: touch &lt;file&gt;</span>`);
    return;
  }

  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const targetPath = resolvePath(currentPath, args[0]);
  const parsed = parsePath(githubUser, currentPath);
  const targetParsed = parsePath(githubUser, targetPath);

  // Stage the create (no API call)
  stageCreate(targetParsed.path, '');
  
  terminal.print(`<span class="success">Staged:</span> new file ${args[0]}`);
}

async function cmdMkdir(terminal, githubUser, args) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Authentication required. Use 'login' to connect.</span>`);
    return;
  }

  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: mkdir &lt;directory&gt;</span>`);
    return;
  }

  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  const dirName = args[0].replace(/\/$/, '');
  const fullDirPath = parsed.path ? `${parsed.path}/${dirName}` : dirName;
  const gitkeepPath = `${fullDirPath}/.gitkeep`;

  // Stage the create (no API call)
  stageCreate(gitkeepPath, '');
  
  terminal.print(`<span class="success">Staged:</span> new directory ${dirName}/`);
}

async function cmdRm(terminal, githubUser, args) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Authentication required. Use 'login' to connect.</span>`);
    return;
  }

  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: rm &lt;file&gt;</span>`);
    return;
  }

  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const targetPath = resolvePath(currentPath, args[0]);
  const targetParsed = parsePath(githubUser, targetPath);

  terminal.showLoading();
  try {
    const fileInfo = await getFile(targetParsed.owner, targetParsed.repo, targetParsed.path);
    terminal.hideLoading();
    
    terminal.print(`<span class="warning">Warning: This will delete "${args[0]}"</span>`);
    terminal.print(`<span class="info">Type 'yes' to confirm:</span>`);
    
    terminal.waitForInput(async (confirmation) => {
      if (confirmation.toLowerCase() !== 'yes') {
        terminal.print(`<span class="info">Operation cancelled</span>`);
        return;
      }

      // Stage the delete (no API call)
      stageDelete(targetParsed.path, fileInfo.sha);
      
      terminal.print(`<span class="success">Staged:</span> deleted ${args[0]}`);
    });
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${escapeHtml(error.message)}</span>`);
  }
}

async function cmdMv(terminal, githubUser, args) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Authentication required. Use 'login' to connect.</span>`);
    return;
  }

  if (args.length < 2) {
    terminal.print(`<span class="error">Usage: mv &lt;source&gt; &lt;destination&gt;</span>`);
    return;
  }

  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const srcPath = resolvePath(currentPath, args[0]);
  const destPath = resolvePath(currentPath, args[1]);
  const srcParsed = parsePath(githubUser, srcPath);
  const destParsed = parsePath(githubUser, destPath);

  terminal.showLoading();
  try {
    const srcFile = await getFile(srcParsed.owner, srcParsed.repo, srcParsed.path);
    terminal.hideLoading();
    
    // Stage delete + create (no API calls)
    stageDelete(srcParsed.path, srcFile.sha);
    stageCreate(destParsed.path, srcFile.content);
    
    terminal.print(`<span class="success">Staged:</span> moved ${args[0]} → ${args[1]}`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${escapeHtml(error.message)}</span>`);
  }
}

async function cmdCp(terminal, githubUser, args) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Authentication required. Use 'login' to connect.</span>`);
    return;
  }

  if (args.length < 2) {
    terminal.print(`<span class="error">Usage: cp &lt;source&gt; &lt;destination&gt;</span>`);
    return;
  }

  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const srcPath = resolvePath(currentPath, args[0]);
  const destPath = resolvePath(currentPath, args[1]);
  const srcParsed = parsePath(githubUser, srcPath);
  const destParsed = parsePath(githubUser, destPath);

  terminal.showLoading();
  try {
    const srcFile = await getFile(srcParsed.owner, srcParsed.repo, srcParsed.path);
    terminal.hideLoading();
    
    // Stage create (no API call)
    stageCreate(destParsed.path, srcFile.content);
    
    terminal.print(`<span class="success">Staged:</span> copied ${args[0]} → ${args[1]}`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${escapeHtml(error.message)}</span>`);
  }
}

async function cmdEdit(terminal, githubUser, args) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Login required. Use 'login' to connect.</span>`);
    return;
  }
  
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: edit &lt;file&gt;</span>`);
    return;
  }
  
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }
  
  const targetPath = resolvePath(currentPath, args[0]);
  const parsed = parsePath(githubUser, targetPath);
  
  if (parsed.path === '') {
    terminal.print(`<span class="error">Not a file. Specify a file path.</span>`);
    return;
  }
  
  terminal.showLoading();
  
  try {
    const token = session.getAccessToken();
    const response = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${parsed.path}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      terminal.hideLoading();
      if (response.status === 404) {
        terminal.print(`<span class="error">File not found: ${parsed.path}</span>`);
      } else {
        terminal.print(`<span class="error">Error loading file</span>`);
      }
      return;
    }
    
    const file = await response.json();
    
    if (file.type !== 'file') {
      terminal.hideLoading();
      terminal.print(`<span class="error">Not a file: ${parsed.path}</span>`);
      return;
    }
    
    terminal.hideLoading();
    
    const content = decodeURIComponent(escape(atob(file.content)));
    
    openEditor({
      owner: parsed.owner,
      repo: parsed.repo,
      path: parsed.path,
      content: content,
      sha: file.sha,
      terminal: terminal
    });
    
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${escapeHtml(error.message)}</span>`);
  }
}

async function cmdBranch(terminal, githubUser, args) {
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  
  if (args[0] === '-c' && args[1]) {
    await createBranchHandler(terminal, parsed, args[1]);
    return;
  }
  
  if (args[0] === '-d' && args[1]) {
    await deleteBranchHandler(terminal, parsed, args[1]);
    return;
  }

  terminal.showLoading();
  try {
    const [branches, repoInfo] = await Promise.all([
      fetchRepoBranches(parsed.owner, parsed.repo),
      getRepoInfo(parsed.owner, parsed.repo)
    ]);
    terminal.hideLoading();
    
    if (branches.length === 0) {
      terminal.print(`<span class="info">No branches found</span>`);
      return;
    }
    
    const currentBranch = terminal.getCurrentBranch ? terminal.getCurrentBranch() : null;
    
    terminal.print('');
    branches.forEach(branch => {
      const isDefault = branch.name === repoInfo.default_branch;
      const isCurrent = currentBranch === branch.name || (!currentBranch && isDefault);
      const prefix = isCurrent ? '* ' : '  ';
      const className = isCurrent ? 'success' : 'directory';
      terminal.print(`${prefix}<span class="${className}">${branch.name}</span>`);
    });
    terminal.print(`\n<span class="info">${branches.length} branch(es)</span>`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function createBranchHandler(terminal, parsed, branchName) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Authentication required. Use 'login' first.</span>`);
    return;
  }
  
  if (!/^[a-zA-Z0-9._/-]+$/.test(branchName)) {
    terminal.print(`<span class="error">Invalid branch name: ${escapeHtml(branchName)}</span>`);
    return;
  }
  
  terminal.showLoading(`Creating branch '${branchName}'...`);
  try {
    const sha = await getDefaultBranchSHA(parsed.owner, parsed.repo);
    await createBranch(parsed.owner, parsed.repo, branchName, sha);
    terminal.hideLoading();
    terminal.print(`<span class="success">Created branch '${branchName}'</span>`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function deleteBranchHandler(terminal, parsed, branchName) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Authentication required. Use 'login' first.</span>`);
    return;
  }
  
  terminal.showLoading();
  try {
    const repoInfo = await getRepoInfo(parsed.owner, parsed.repo);
    terminal.hideLoading();
    
    if (branchName === repoInfo.default_branch) {
      terminal.print(`<span class="error">Cannot delete the default branch '${branchName}'</span>`);
      return;
    }
    
    const currentBranch = terminal.getCurrentBranch ? terminal.getCurrentBranch() : null;
    if (currentBranch === branchName) {
      terminal.print(`<span class="error">Cannot delete the current branch. Checkout another branch first.</span>`);
      return;
    }
    
    terminal.showLoading(`Deleting branch '${branchName}'...`);
    await deleteBranch(parsed.owner, parsed.repo, branchName);
    terminal.hideLoading();
    terminal.print(`<span class="success">Deleted branch '${branchName}'</span>`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdCheckout(terminal, githubUser, args) {
  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: checkout &lt;branch&gt;</span>`);
    return;
  }
  
  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }
  
  const parsed = parsePath(githubUser, currentPath);
  const branchName = args[0];
  
  terminal.showLoading();
  try {
    const branches = await fetchRepoBranches(parsed.owner, parsed.repo);
    terminal.hideLoading();
    
    const branchExists = branches.some(b => b.name === branchName);
    if (!branchExists) {
      terminal.print(`<span class="error">Branch '${branchName}' not found</span>`);
      return;
    }
    
    if (terminal.setCurrentBranch) {
      terminal.setCurrentBranch(branchName);
    }
    
    clearBranchCache(parsed.owner, parsed.repo);
    
    terminal.print(`<span class="success">Switched to branch '${branchName}'</span>`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}

async function cmdAdd(terminal, githubUser, args) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Authentication required. Use 'login' to connect.</span>`);
    return;
  }

  if (args.length === 0) {
    terminal.print(`<span class="error">Usage: add &lt;file&gt; [file2] ...</span>`);
    return;
  }

  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  
  terminal.showLoading();
  
  let addedCount = 0;
  let errorCount = 0;

  for (const arg of args) {
    const targetPath = resolvePath(currentPath, arg);
    const targetParsed = parsePath(githubUser, targetPath);
    
    if (!targetParsed.path) {
      terminal.hideLoading();
      terminal.print(`<span class="error">Not a file: ${arg}</span>`);
      errorCount++;
      continue;
    }

    try {
      const fileInfo = await getFile(targetParsed.owner, targetParsed.repo, targetParsed.path);
      stageUpdate(targetParsed.path, fileInfo.content, fileInfo.sha);
      addedCount++;
    } catch (error) {
      terminal.hideLoading();
      terminal.print(`<span class="error">File not found: ${arg}</span>`);
      errorCount++;
    }
  }
  
  terminal.hideLoading();
  
  if (addedCount > 0) {
    terminal.print(`<span class="success">Staged ${addedCount} file(s)</span>`);
  }
  if (errorCount > 0) {
    terminal.print(`<span class="info">${errorCount} file(s) could not be staged</span>`);
  }
}

async function cmdDiff(terminal, githubUser) {
  const changes = getStagedChanges();
  
  if (!hasStagedChanges()) {
    terminal.print(`<span class="info">No staged changes</span>`);
    return;
  }

  terminal.print('');
  
  let totalInsertions = 0;
  let totalDeletions = 0;
  let filesChanged = 0;

  for (const item of changes.creates) {
    terminal.print(`<span class="success">+++ b/${item.path}</span> <span class="info">(new file)</span>`);
    const lines = item.content.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        terminal.print(`<span class="success">+${escapeHtml(line)}</span>`);
        totalInsertions++;
      }
    }
    filesChanged++;
    terminal.print('');
  }

  for (const item of changes.updates) {
    terminal.print(`<span class="success">+++ b/${item.path}</span>`);
    const lines = item.content.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        terminal.print(`<span class="success">+${escapeHtml(line)}</span>`);
        totalInsertions++;
      }
    }
    filesChanged++;
    terminal.print('');
  }

  for (const item of changes.deletes) {
    terminal.print(`<span class="error">--- a/${item.path}</span> <span class="info">(deleted)</span>`);
    totalDeletions++;
    filesChanged++;
  }

  terminal.print(`<span class="info">${filesChanged} file(s) changed, ${totalInsertions} insertion(s), ${totalDeletions} deletion(s)</span>`);
}

async function cmdCommit(terminal, githubUser, args) {
  if (!session.isAuthenticated()) {
    terminal.print(`<span class="error">Authentication required. Use 'login' to connect.</span>`);
    return;
  }

  const messageIndex = args.indexOf('-m');
  if (messageIndex === -1 || messageIndex + 1 >= args.length) {
    terminal.print(`<span class="error">Usage: commit -m "message"</span>`);
    return;
  }

  const message = args.slice(messageIndex + 1).join(' ');
  if (!message || message.trim() === '') {
    terminal.print(`<span class="error">Commit message cannot be empty</span>`);
    return;
  }

  if (!hasStagedChanges()) {
    terminal.print(`<span class="info">No staged changes to commit</span>`);
    return;
  }

  const currentPath = terminal.getPath();
  
  if (currentPath === '/') {
    terminal.print(`<span class="error">Not in a repository. Use 'cd' to enter a repo first.</span>`);
    return;
  }

  const parsed = parsePath(githubUser, currentPath);
  const branch = terminal.getCurrentBranch ? terminal.getCurrentBranch() : null;
  const targetBranch = branch || (await getRepoInfo(parsed.owner, parsed.repo)).default_branch;

  const changes = getStagedChanges();
  
  terminal.showLoading(`Committing ${changes.creates.length + changes.updates.length + changes.deletes.length} changes...`);
  
  try {
    const result = await batchCommit(
      parsed.owner,
      parsed.repo,
      targetBranch,
      changes,
      message
    );
    
    terminal.hideLoading();
    
    clearStaging();
    
    terminal.print('');
    terminal.print(`<span class="success">[${targetBranch} ${result.sha.substring(0, 7)}]</span> ${escapeHtml(message)}`);
    terminal.print(`<span class="info">${result.stats.created} created, ${result.stats.updated} updated, ${result.stats.deleted} deleted</span>`);
  } catch (error) {
    terminal.hideLoading();
    terminal.print(`<span class="error">Error: ${error.message}</span>`);
  }
}
