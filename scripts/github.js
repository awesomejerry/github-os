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
  const cacheKey = `repos:${username}:${isAuthenticated() ? 'auth' : 'public'}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    let url;
    let repos;
    
    if (isAuthenticated()) {
      // Use /user/repos to get all repos (including private)
      url = `${GITHUB_API.BASE_URL}/user/repos?per_page=${GITHUB_API.REPOS_PER_PAGE}&sort=updated&affiliation=owner`;
      const response = await fetch(url, { headers: getHeaders() });
      checkRateLimit(response);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      repos = await response.json();
    } else {
      // Use /users/{username}/repos for public only
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

export { getHeaders };
