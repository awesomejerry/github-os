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
 * Fetch user's public repositories
 */
export async function fetchUserRepos(username) {
  const cacheKey = `repos:${username}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${GITHUB_API.BASE_URL}/users/${username}/repos?per_page=${GITHUB_API.REPOS_PER_PAGE}&sort=updated`,
      { headers: getHeaders() }
    );
    
    checkRateLimit(response);
    if (!response.ok) throw new Error('User not found');
    
    const repos = await response.json();
    
    const formattedRepos = repos.map(repo => ({
      name: repo.name,
      type: 'dir',
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language
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
    if (key.includes(`:${username}/`) || key === `repos:${username}`) {
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
