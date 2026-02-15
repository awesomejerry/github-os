// GitHub OS - GitHub API Functions

import { GITHUB_API } from './config.js';

// Cache for loaded data
const cache = new Map();

/**
 * Get cache (for tab completion)
 */
export function getCache() {
  return cache;
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
      `${GITHUB_API.BASE_URL}/users/${username}/repos?per_page=${GITHUB_API.REPOS_PER_PAGE}&sort=updated`
    );
    
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
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contents/${path}`
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
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/contents/${path}`
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
      `${GITHUB_API.BASE_URL}/repos/${owner}/${repo}`
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
      html_url: data.html_url
    };
    
    cache.set(cacheKey, info);
    return info;
  } catch (error) {
    throw new Error(`Failed to fetch repo info: ${error.message}`);
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
