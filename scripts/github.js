// GitHub OS - GitHub API Functions

import { GITHUB_API } from './config.js';
import { getAccessToken, isAuthenticated } from './session.js';

// Cache for loaded data
const cache = new Map();

/**
 * Get headers for GitHub API requests (with auth if available)
 */
function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (isAuthenticated()) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * Handle API errors with user-friendly messages
 */
function handleApiError(error, operation = 'operation') {
  // Network errors
  if (error.name === 'TypeError' && (
    error.message.includes('fetch') || 
    error.message.includes('network') ||
    error.message.includes('Failed to fetch')
  )) {
    return `Failed to connect to GitHub. Please check your internet connection.`;
  }
  
  // Timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return `Request timed out. Please try again.`;
  }
  
  // Other errors
  return `Failed to ${operation}: ${error.message}`;
}

/**
 * Get cache (for tab completion)
 */
export function getCache() {
  return cache;
}

/**
 * Check if response indicates rate limit exceeded
 */
function checkRateLimit(response) {
  if (response.status === 403) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    
    if (remaining === '0' || response.status === 403) {
      let message = 'GitHub API rate limit exceeded';
      if (reset) {
        const resetTime = new Date(parseInt(reset) * 1000);
        const minutes = Math.ceil((resetTime - new Date()) / 60000);
        message += `. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
      throw new Error(message);
    }
  }
}

/**
 * Fetch user's repositories
 * If authenticated, includes private repos
 */
export async function fetchUserRepos(username) {
  // Check if we're fetching the logged-in user's own repos
  const session = await import('./session.js').then(m => m.loadSession());
  const isOwnRepos = session?.username && session.username.toLowerCase() === username.toLowerCase();
  
  const cacheKey = `repos:${username}:${isAuthenticated() && isOwnRepos ? 'auth' : 'public'}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    let url;
    let repos;
    
    if (isAuthenticated() && isOwnRepos) {
      // Use /user/repos to get all repos including private for logged-in user's own repos
      url = `${GITHUB_API.BASE_URL}/user/repos?per_page=${GITHUB_API.REPOS_PER_PAGE}&sort=updated&affiliation=owner`;
      const response = await fetch(url, { headers: getHeaders() });
      checkRateLimit(response);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      repos = await response.json();
    } else {
      // Use /users/{username}/repos for public repos (or when viewing other users)
      url = `${GITHUB_API.BASE_URL}/users/${username}/repos?per_page=${GITHUB_API.REPOS_PER_PAGE}&sort=updated`;
      const response = await fetch(url, { headers: getHeaders() });
      checkRateLimit(response);
      if (!response.ok) throw new Error('User not found');
      repos = await response.json();
    }
    
    const formattedRepos = repos.map(repo => ({
      name: repo.name,
      type: 'dir',
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      private: repo.private
    }));
    
    cache.set(cacheKey, formattedRepos);
    return formattedRepos;
  } catch (error) {
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
}

/**
 * Fetch contents of a repository path
 */
export async function fetchRepoContents(owner, repo, path = '') {
  const cacheKey = `contents:${owner}/${repo}/${path}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) throw new Error('Path not found');
    
    const contents = await response.json();
    
    const items = Array.isArray(contents) 
      ? contents.map(item => ({
          name: item.name,
          type: item.type === 'dir' ? 'dir' : 'file',
          size: item.size,
          download_url: item.download_url
        }))
      : contents;

    cache.set(cacheKey, items);
    return items;
  } catch (error) {
    throw new Error(`Failed to fetch contents: ${error.message}`);
  }
}

/**
 * Fetch file content (base64 decoded)
 */
export async function fetchFileContent(owner, repo, path) {
  const cacheKey = `file:${owner}/${repo}/${path}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) throw new Error('File not found');
    
    const file = await response.json();
    
    if (file.type !== 'file') throw new Error('Not a file');
    
    // Decode base64 content
    const content = atob(file.content);
    const result = { content, name: file.name };
    
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch file: ${error.message}`);
  }
}

/**
 * Check if a repository exists
 */
export async function repoExists(owner, repo) {
  try {
    const repos = await fetchUserRepos(owner);
    return repos.some(r => r.name === repo);
  } catch {
    return false;
  }
}

/**
 * Clear cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Get repository details
 */
export async function getRepoInfo(owner, repo) {
  const cacheKey = `info:${owner}/${repo}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) throw new Error('Repository not found');
    
    const data = await response.json();
    
    const info = {
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.watchers_count,
      language: data.language,
      topics: data.topics || [],
      license: data.license?.spdx_id || 'None',
      created_at: data.created_at,
      updated_at: data.updated_at,
      homepage: data.homepage,
      html_url: data.html_url,
      default_branch: data.default_branch || 'main'
    };
    
    cache.set(cacheKey, info);
    return info;
  } catch (error) {
    throw new Error(`Failed to fetch repo info: ${error.message}`);
  }
}

/**
 * Search code within a repository using GitHub API
 * Note: GitHub code search API requires authentication
 */
export async function searchCode(owner, repo, query, path = '') {
  try {
    // Build search query: term repo:owner/repo [path:folder]
    let searchQuery = `${query} repo:${owner}/${repo}`;
    if (path) {
      searchQuery += ` path:${path}`;
    }
    
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/search/code?q=${encodeURIComponent(searchQuery)}&per_page=30`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('API rate limit exceeded. Try again later.');
      }
      if (response.status === 401 || response.status === 422) {
        throw new Error('REQUIRE_AUTH');
      }
      throw new Error('Search failed');
    }
    
    const data = await response.json();
    
    return data.items.map(item => ({
      name: item.name,
      path: item.path,
      html_url: item.html_url
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Clear cache for a specific user (for connect command)
 */
export function clearUserCache(username) {
  for (const key of cache.keys()) {
    // Match repos:${username}, repos:${username}:auth, repos:${username}:public
    // Also match :${username}/ for content/info/commits etc
    if (key.includes(`:${username}/`) || 
        key === `repos:${username}` || 
        key.startsWith(`repos:${username}:`)) {
      cache.delete(key);
    }
  }
}

export async function fetchRepoCommits(owner, repo, count = 10) {
  const cacheKey = `commits:${owner}/${repo}:${count}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/commits?per_page=${count}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      if (response.status === 409) {
        return [];
      }
      throw new Error('Failed to fetch commits');
    }
    
    const commits = await response.json();
    
    const formattedCommits = commits.map(commit => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0].substring(0, 72),
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      html_url: commit.html_url
    }));
    
    cache.set(cacheKey, formattedCommits);
    return formattedCommits;
  } catch (error) {
    throw new Error(`Failed to fetch commits: ${error.message}`);
  }
}

export async function fetchRepoBranches(owner, repo) {
  const cacheKey = `branches:${owner}/${repo}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/branches?per_page=100`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch branches');
    }
    
    const branches = await response.json();
    
    const formattedBranches = branches.map(branch => ({
      name: branch.name,
      protected: branch.protected || false
    }));
    
    cache.set(cacheKey, formattedBranches);
    return formattedBranches;
  } catch (error) {
    throw new Error(`Failed to fetch branches: ${error.message}`);
  }
}

export async function fetchRepoTree(owner, repo, branch = 'main') {
  const cacheKey = `tree:${owner}/${repo}:${branch}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository or branch not found');
      }
      throw new Error('Failed to fetch repository tree');
    }
    
    const data = await response.json();
    
    const files = data.tree
      .filter(item => item.type === 'blob')
      .map(item => ({
        path: item.path,
        type: 'file'
      }));
    
    cache.set(cacheKey, files);
    return files;
  } catch (error) {
    throw new Error(`Failed to fetch tree: ${error.message}`);
  }
}

export async function fetchRepoIssues(owner, repo, state = 'open') {
  const cacheKey = `issues:${owner}/${repo}:${state}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/issues?state=${state}&per_page=30`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }
    
    const issues = await response.json();
    
    const formattedIssues = issues
      .filter(issue => !issue.pull_request)
      .map(issue => ({
        number: issue.number,
        title: issue.title,
        author: issue.user.login,
        labels: issue.labels.map(label => label.name),
        created_at: issue.created_at,
        state: issue.state,
        html_url: issue.html_url
      }));
    
    cache.set(cacheKey, formattedIssues);
    return formattedIssues;
  } catch (error) {
    throw new Error(`Failed to fetch issues: ${error.message}`);
  }
}

export async function fetchRepoPRs(owner, repo, state = 'open') {
  const cacheKey = `prs:${owner}/${repo}:${state}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/pulls?state=${state}&per_page=30`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      throw new Error('Failed to fetch pull requests');
    }
    
    const prs = await response.json();
    
    const formattedPRs = prs.map(pr => ({
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      labels: pr.labels.map(label => label.name),
      created_at: pr.created_at,
      state: pr.state,
      draft: pr.draft,
      head_branch: pr.head.ref,
      base_branch: pr.base.ref,
      html_url: pr.html_url
    }));
    
    cache.set(cacheKey, formattedPRs);
    return formattedPRs;
  } catch (error) {
    throw new Error(`Failed to fetch pull requests: ${error.message}`);
  }
}

export async function fetchRepoPR(owner, repo, number) {
  const cacheKey = `pr:${owner}/${repo}:${number}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/pulls/${number}`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Pull request not found');
      }
      throw new Error('Failed to fetch pull request');
    }
    
    const pr = await response.json();
    
    const formattedPR = {
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      state: pr.state,
      draft: pr.draft,
      merged: pr.merged,
      created_at: pr.created_at,
      merged_at: pr.merged_at,
      closed_at: pr.closed_at,
      head_branch: pr.head.ref,
      base_branch: pr.base.ref,
      body: pr.body || '',
      labels: pr.labels.map(label => label.name),
      additions: pr.additions,
      deletions: pr.deletions,
      changed_files: pr.changed_files,
      html_url: pr.html_url
    };
    
    cache.set(cacheKey, formattedPR);
    return formattedPR;
  } catch (error) {
    throw error;
  }
}

export async function fetchRepoReleases(owner, repo, count = 10) {
  const cacheKey = `releases:${owner}/${repo}:${count}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/releases?per_page=${count}`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      throw new Error('Failed to fetch releases');
    }
    
    const releases = await response.json();
    
    const formattedReleases = releases.map(release => ({
      tag_name: release.tag_name,
      name: release.name || release.tag_name,
      author: release.author?.login || 'unknown',
      published_at: release.published_at,
      prerelease: release.prerelease,
      html_url: release.html_url
    }));
    
    cache.set(cacheKey, formattedReleases);
    return formattedReleases;
  } catch (error) {
    throw new Error(`Failed to fetch releases: ${error.message}`);
  }
}

export async function fetchRepoContributors(owner, repo, count = 20) {
  const cacheKey = `contributors:${owner}/${repo}:${count}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contributors?per_page=${count}`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (response.status === 204) {
      return [];
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch contributors');
    }
    
    const contributors = await response.json();
    
    const formattedContributors = contributors.map(contributor => ({
      login: contributor.login,
      avatar_url: contributor.avatar_url,
      contributions: contributor.contributions,
      html_url: contributor.html_url
    }));
    
    cache.set(cacheKey, formattedContributors);
    return formattedContributors;
  } catch (error) {
    throw new Error(`Failed to fetch contributors: ${error.message}`);
  }
}

export async function getFile(owner, repo, path) {
  const cacheKey = `fileinfo:${owner}/${repo}/${path}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      if (response.status === 404) throw new Error('File not found');
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      throw new Error('Failed to fetch file');
    }
    
    const file = await response.json();
    
    if (file.type !== 'file') throw new Error('Not a file');
    
    const content = atob(file.content);
    const result = { 
      content, 
      name: file.name, 
      sha: file.sha,
      path: file.path,
      size: file.size
    };
    
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function createFile(owner, repo, path, content, message) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          message,
          content: encodedContent
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 422) throw new Error('File already exists');
      throw new Error('Failed to create file');
    }
    
    const result = await response.json();
    
    clearCache();
    
    return {
      sha: result.commit.sha,
      content: result.content
    };
  } catch (error) {
    throw error;
  }
}

export async function updateFile(owner, repo, path, content, sha, message) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          message,
          content: encodedContent,
          sha
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error('File not found');
      if (response.status === 409) throw new Error('Conflict: file was modified');
      throw new Error('Failed to update file');
    }
    
    const result = await response.json();
    
    clearCache();
    
    return {
      sha: result.commit.sha
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteFile(owner, repo, path, sha, message) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({
          message,
          sha
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error('File not found');
      if (response.status === 409) throw new Error('Conflict: file was modified');
      throw new Error('Failed to delete file');
    }
    
    const result = await response.json();
    
    clearCache();
    
    return {
      sha: result.commit.sha
    };
  } catch (error) {
    throw error;
  }
}

export async function checkFileExists(owner, repo, path) {
  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      { headers: getHeaders() }
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function getDefaultBranchSHA(owner, repo) {
  try {
    const repoInfo = await getRepoInfo(owner, repo);
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/git/refs/heads/${repoInfo.default_branch}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      throw new Error('Failed to get default branch SHA');
    }
    
    const data = await response.json();
    return data.object.sha;
  } catch (error) {
    throw error;
  }
}

export async function createBranch(owner, repo, name, sha) {
  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/git/refs`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ref: `refs/heads/${name}`,
          sha: sha
        })
      }
    );
    
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    
    if (response.status === 403) {
      throw new Error('Permission denied');
    }
    
    if (response.status === 422) {
      throw new Error(`Branch '${name}' already exists`);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create branch');
    }
    
    clearBranchCache(owner, repo);
    
    return true;
  } catch (error) {
    throw error;
  }
}

export async function deleteBranch(owner, repo, name) {
  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/git/refs/heads/${name}`,
      {
        method: 'DELETE',
        headers: getHeaders()
      }
    );
    
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    
    if (response.status === 403) {
      throw new Error('Permission denied or branch is protected');
    }
    
    if (response.status === 404) {
      throw new Error(`Branch '${name}' not found`);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete branch');
    }
    
    clearBranchCache(owner, repo);
    
    return true;
  } catch (error) {
    throw error;
  }
}

export function clearBranchCache(owner, repo) {
  for (const key of cache.keys()) {
    if (key.startsWith(`branches:${owner}/${repo}`) ||
        key.startsWith(`ref:${owner}/${repo}`) ||
        key.startsWith(`tree:${owner}/${repo}`)) {
      cache.delete(key);
    }
  }
}

export async function getBranchRef(owner, repo, branch) {
  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Branch '${branch}' not found`);
      }
      throw new Error('Failed to get branch ref');
    }
    
    const data = await response.json();
    return data.object.sha;
  } catch (error) {
    throw error;
  }
}

export async function getTreeFromCommit(owner, repo, commitSha) {
  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/git/commits/${commitSha}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      throw new Error('Failed to get commit');
    }
    
    const data = await response.json();
    return data.tree.sha;
  } catch (error) {
    throw error;
  }
}

export async function createTree(owner, repo, baseTreeSha, entries) {
  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: entries
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create tree');
    }
    
    const data = await response.json();
    return data.sha;
  } catch (error) {
    throw error;
  }
}

export async function createGitCommit(owner, repo, treeSha, parentSha, message) {
  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/git/commits`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          message,
          tree: treeSha,
          parents: [parentSha]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create commit');
    }
    
    const data = await response.json();
    return data.sha;
  } catch (error) {
    throw error;
  }
}

export async function updateBranchRef(owner, repo, branch, commitSha) {
  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          sha: commitSha
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 422) {
        throw new Error('Conflict: branch was modified. Please retry.');
      }
      throw new Error('Failed to update branch');
    }
    
    return true;
  } catch (error) {
    throw error;
  }
}

export async function batchCommit(owner, repo, branch, changes, message) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }
  
  const { creates, updates, deletes } = changes;
  const totalChanges = creates.length + updates.length + deletes.length;
  
  if (totalChanges === 0) {
    throw new Error('No staged changes');
  }
  
  const treeEntries = [];
  
  // Creates - pass raw content, GitHub handles encoding
  for (const item of creates) {
    treeEntries.push({
      path: item.path,
      mode: '100644',
      type: 'blob',
      content: item.content
    });
  }
  
  // Updates - pass raw content, GitHub handles encoding
  for (const item of updates) {
    treeEntries.push({
      path: item.path,
      mode: '100644',
      type: 'blob',
      content: item.content
    });
  }
  
  // Deletes - set sha to null
  for (const item of deletes) {
    treeEntries.push({
      path: item.path,
      mode: '100644',
      type: 'blob',
      sha: null
    });
  }
  
  const parentSha = await getBranchRef(owner, repo, branch);
  const baseTreeSha = await getTreeFromCommit(owner, repo, parentSha);
  const newTreeSha = await createTree(owner, repo, baseTreeSha, treeEntries);
  const commitSha = await createGitCommit(owner, repo, newTreeSha, parentSha, message);
  await updateBranchRef(owner, repo, branch, commitSha);
  
  clearCache();
  clearBranchCache(owner, repo);
  
  return {
    sha: commitSha,
    stats: {
      created: creates.length,
      updated: updates.length,
      deleted: deletes.length,
      total: totalChanges
    }
  };
}

export async function createPR(owner, repo, title, body, head, base) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/pulls`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title,
          body,
          head,
          base
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Validation failed');
      }
      throw new Error('Failed to create PR');
    }
    
    const pr = await response.json();
    
    return {
      number: pr.number,
      title: pr.title,
      html_url: pr.html_url,
      state: pr.state
    };
  } catch (error) {
    // Check for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Failed to connect to GitHub. Please check your internet connection.');
    }
    throw error;
  }
}

export async function mergePR(owner, repo, number, commitTitle) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/pulls/${number}/merge`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          commit_title: commitTitle,
          merge_method: 'merge'
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error(`PR #${number} not found`);
      if (response.status === 405) {
        throw new Error('PR is not mergeable. It may be closed or already merged');
      }
      if (response.status === 409) {
        throw new Error('Merge failed: PR has conflicts that must be resolved');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to merge PR');
    }
    
    const result = await response.json();
    
    return {
      sha: result.sha,
      merged: result.merged,
      message: result.message
    };
  } catch (error) {
    throw error;
  }
}

export async function closePR(owner, repo, number) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/pulls/${number}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          state: 'closed'
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error(`PR #${number} not found`);
      throw new Error('Failed to close PR');
    }
    
    const pr = await response.json();
    
    return {
      number: pr.number,
      state: pr.state,
      html_url: pr.html_url
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchPR(owner, repo, number) {
  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/pulls/${number}`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      if (response.status === 404) throw new Error(`PR #${number} not found`);
      throw new Error('Failed to fetch PR');
    }
    
    const pr = await response.json();
    
    return {
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      head: pr.head.ref,
      base: pr.base.ref,
      html_url: pr.html_url,
      user: pr.user.login,
      created_at: pr.created_at
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchIssue(owner, repo, number) {
  const cacheKey = `issue:${owner}/${repo}:${number}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/issues/${number}`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Issue not found');
      }
      throw new Error('Failed to fetch issue');
    }
    
    const issue = await response.json();
    
    if (issue.pull_request) {
      throw new Error('Not an issue (this is a pull request)');
    }
    
    const formattedIssue = {
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      state: issue.state,
      author: issue.user.login,
      labels: issue.labels.map(label => label.name),
      created_at: issue.created_at,
      html_url: issue.html_url,
      comments: issue.comments
    };
    
    cache.set(cacheKey, formattedIssue);
    return formattedIssue;
  } catch (error) {
    throw error;
  }
}

export async function createIssue(owner, repo, title, body) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/issues`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title,
          body
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Validation failed');
      }
      throw new Error('Failed to create issue');
    }
    
    const issue = await response.json();
    
    return {
      number: issue.number,
      title: issue.title,
      html_url: issue.html_url,
      state: issue.state
    };
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Failed to connect to GitHub. Please check your internet connection.');
    }
    throw error;
  }
}

export async function updateIssue(owner, repo, number, state) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/issues/${number}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          state
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error(`Issue #${number} not found`);
      throw new Error('Failed to update issue');
    }
    
    const issue = await response.json();
    
    cache.delete(`issue:${owner}/${repo}:${number}`);
    cache.delete(`issues:${owner}/${repo}:open`);
    cache.delete(`issues:${owner}/${repo}:closed`);
    cache.delete(`issues:${owner}/${repo}:all`);
    
    return {
      number: issue.number,
      title: issue.title,
      state: issue.state,
      html_url: issue.html_url
    };
  } catch (error) {
    throw error;
  }
}

export async function addIssueComment(owner, repo, number, body) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/issues/${number}/comments`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          body
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error(`Issue #${number} not found`);
      throw new Error('Failed to add comment');
    }
    
    const comment = await response.json();
    
    return {
      id: comment.id,
      html_url: comment.html_url
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchUserOrgs() {
  const cacheKey = 'orgs:user';
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/user/orgs?per_page=100`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      throw new Error('Failed to fetch organizations');
    }
    
    const orgs = await response.json();
    
    const formattedOrgs = orgs.map(org => ({
      login: org.login,
      name: org.name || org.login,
      description: org.description || '',
      avatar_url: org.avatar_url,
      html_url: org.html_url,
      public_repos: org.public_repos
    }));
    
    cache.set(cacheKey, formattedOrgs);
    return formattedOrgs;
  } catch (error) {
    throw new Error(`Failed to fetch organizations: ${error.message}`);
  }
}

export async function fetchOrgInfo(org) {
  const cacheKey = `org:${org}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/orgs/${org}`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 404) throw new Error(`Organization not found: ${org}`);
      if (response.status === 403) throw new Error('Access denied. Re-login with read:org scope.');
      throw new Error('Failed to fetch organization');
    }
    
    const data = await response.json();
    
    const info = {
      login: data.login,
      name: data.name || data.login,
      description: data.description || '',
      location: data.location || '',
      blog: data.blog || '',
      email: data.email || '',
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      created_at: data.created_at,
      html_url: data.html_url,
      avatar_url: data.avatar_url
    };
    
    cache.set(cacheKey, info);
    return info;
  } catch (error) {
    throw error;
  }
}

export async function fetchOrgRepos(org) {
  const cacheKey = `org:${org}:repos`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/orgs/${org}/repos?per_page=100&sort=updated`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 404) throw new Error(`Organization not found: ${org}`);
      if (response.status === 403) throw new Error('Access denied. Re-login with read:org scope.');
      throw new Error('Failed to fetch organization repos');
    }
    
    const repos = await response.json();
    
    const formattedRepos = repos.map(repo => ({
      name: repo.name,
      type: 'dir',
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      private: repo.private,
      html_url: repo.html_url
    }));
    
    cache.set(cacheKey, formattedRepos);
    return formattedRepos;
  } catch (error) {
    throw error;
  }
}

export async function fetchOrgTeams(org) {
  const cacheKey = `org:${org}:teams`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/orgs/${org}/teams?per_page=100`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 404) throw new Error(`Organization not found: ${org}`);
      if (response.status === 403) throw new Error('Access denied. Re-login with read:org scope.');
      throw new Error('Failed to fetch organization teams');
    }
    
    const teams = await response.json();
    
    const formattedTeams = teams.map(team => ({
      name: team.name,
      slug: team.slug,
      description: team.description || '',
      members_count: team.members_count || 0,
      repos_count: team.repos_count || 0,
      privacy: team.privacy,
      html_url: team.html_url
    }));
    
    cache.set(cacheKey, formattedTeams);
    return formattedTeams;
  } catch (error) {
    throw error;
  }
}

export async function fetchTeamRepos(org, teamSlug) {
  const cacheKey = `team:${org}:${teamSlug}:repos`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/orgs/${org}/teams/${teamSlug}/repos?per_page=100`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 404) throw new Error(`Team not found: ${teamSlug}`);
      if (response.status === 403) throw new Error('Access denied. Re-login with read:org scope.');
      throw new Error('Failed to fetch team repos');
    }
    
    const repos = await response.json();
    
    const formattedRepos = repos.map(repo => ({
      name: repo.name,
      type: 'dir',
      description: repo.description,
      language: repo.language,
      private: repo.private,
      permissions: repo.permissions,
      html_url: repo.html_url
    }));
    
    cache.set(cacheKey, formattedRepos);
    return formattedRepos;
  } catch (error) {
    throw error;
  }
}

export async function fetchTeamMembers(org, teamSlug) {
  const cacheKey = `team:${org}:${teamSlug}:members`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/orgs/${org}/teams/${teamSlug}/members?per_page=100`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 404) throw new Error(`Team not found: ${teamSlug}`);
      if (response.status === 403) throw new Error('Access denied. Re-login with read:org scope.');
      throw new Error('Failed to fetch team members');
    }
    
    const members = await response.json();
    
    const formattedMembers = members.map(member => ({
      login: member.login,
      avatar_url: member.avatar_url,
      html_url: member.html_url,
      type: member.type
    }));

    cache.set(cacheKey, formattedMembers);
    return formattedMembers;
  } catch (error) {
    throw error;
  }
}

export async function fetchNotifications(all = false) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  const cacheKey = `notifications:${all ? 'all' : 'recent'}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const params = new URLSearchParams({ per_page: '50' });
    if (all) {
      params.set('all', 'true');
    }
    
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/notifications?${params.toString()}`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      throw new Error('Failed to fetch notifications');
    }
    
    const notifications = await response.json();
    
    const formattedNotifications = notifications.map(n => ({
      id: n.id,
      unread: n.unread,
      reason: n.reason,
      updated_at: n.updated_at,
      repository: {
        full_name: n.repository.full_name,
        name: n.repository.name,
        owner: n.repository.owner.login
      },
      subject: {
        title: n.subject.title,
        type: n.subject.type,
        url: n.subject.url,
        html_url: n.subject.html_url
      }
    }));
    
    cache.set(cacheKey, formattedNotifications);
    return formattedNotifications;
  } catch (error) {
    throw error;
  }
}

export async function markNotificationsRead() {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/notifications`,
      {
        method: 'PUT',
        headers: getHeaders()
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      throw new Error('Failed to mark notifications as read');
    }
    
    cache.delete('notifications:all');
    cache.delete('notifications:recent');
    
    return true;
  } catch (error) {
    throw error;
  }
}

export async function fetchWorkflowRuns(owner, repo) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  const cacheKey = `workflow-runs:${owner}/${repo}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/actions/runs?per_page=30`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error('Repository not found');
      throw new Error('Failed to fetch workflow runs');
    }
    
    const data = await response.json();
    
    const formattedRuns = data.workflow_runs.map(run => ({
      id: run.id,
      name: run.name,
      display_title: run.display_title,
      status: run.status,
      conclusion: run.conclusion,
      branch: run.head_branch,
      commit_sha: run.head_sha?.substring(0, 7),
      event: run.event,
      created_at: run.created_at,
      updated_at: run.updated_at,
      html_url: run.html_url,
      workflow_id: run.workflow_id,
      run_number: run.run_number,
      actor: run.actor?.login
    }));
    
    cache.set(cacheKey, formattedRuns);
    return formattedRuns;
  } catch (error) {
    throw error;
  }
}

export async function fetchWorkflowRun(owner, repo, runId) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  const cacheKey = `workflow-run:${owner}/${repo}:${runId}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/actions/runs/${runId}`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error('Run not found');
      throw new Error('Failed to fetch workflow run');
    }
    
    const run = await response.json();
    
    const formattedRun = {
      id: run.id,
      name: run.name,
      display_title: run.display_title,
      status: run.status,
      conclusion: run.conclusion,
      branch: run.head_branch,
      commit_sha: run.head_sha?.substring(0, 7),
      event: run.event,
      created_at: run.created_at,
      updated_at: run.updated_at,
      html_url: run.html_url,
      workflow_id: run.workflow_id,
      run_number: run.run_number,
      actor: run.actor?.login,
      jobs_url: run.jobs_url
    };
    
    cache.set(cacheKey, formattedRun);
    return formattedRun;
  } catch (error) {
    throw error;
  }
}

export async function fetchWorkflowJobs(owner, repo, runId) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  const cacheKey = `workflow-jobs:${owner}/${repo}:${runId}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      throw new Error('Failed to fetch workflow jobs');
    }
    
    const data = await response.json();
    
    const formattedJobs = data.jobs.map(job => ({
      id: job.id,
      name: job.name,
      status: job.status,
      conclusion: job.conclusion,
      started_at: job.started_at,
      completed_at: job.completed_at,
      steps: job.steps?.map(step => ({
        name: step.name,
        status: step.status,
        conclusion: step.conclusion,
        number: step.number
      })) || []
    }));
    
    cache.set(cacheKey, formattedJobs);
    return formattedJobs;
  } catch (error) {
    throw error;
  }
}

export async function fetchWorkflowLogs(owner, repo, runId) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/actions/runs/${runId}/logs`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      if (response.status === 404) throw new Error('Logs not available');
      throw new Error('Failed to fetch workflow logs');
    }
    
    const logText = await response.text();
    return logText;
  } catch (error) {
    throw error;
  }
}

export async function rerunWorkflow(owner, repo, runId) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/actions/runs/${runId}/rerun`,
      {
        method: 'POST',
        headers: getHeaders()
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error('Run not found');
      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Cannot rerun this workflow');
      }
      throw new Error('Failed to rerun workflow');
    }
    
    cache.delete(`workflow-runs:${owner}/${repo}`);
    
    return true;
  } catch (error) {
    throw error;
  }
}

export async function fetchWorkflows(owner, repo) {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  const cacheKey = `workflows:${owner}/${repo}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/actions/workflows`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Permission denied');
      if (response.status === 404) throw new Error('Repository not found');
      throw new Error('Failed to fetch workflows');
    }
    
    const data = await response.json();
    
    const formattedWorkflows = data.workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      path: workflow.path,
      state: workflow.state,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
      html_url: workflow.html_url
    }));
    
    cache.set(cacheKey, formattedWorkflows);
    return formattedWorkflows;
  } catch (error) {
    throw error;
  }
}

export { getHeaders };
