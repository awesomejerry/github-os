// Mock GitHub API responses

export const mockRepos = [
  { name: 'github-os', language: 'JavaScript', stargazers_count: 10, description: 'Terminal for GitHub' },
  { name: 'antidle', language: 'JavaScript', stargazers_count: 5, description: 'Ant idle game' },
  { name: 'constellation-builder', language: 'HTML', stargazers_count: 42, description: 'Build constellations' }
];

export const mockRepoInfo = {
  name: 'github-os',
  full_name: 'awesomejerry/github-os',
  description: 'A web-based terminal interface',
  default_branch: 'main',
  stargazers_count: 10,
  forks_count: 2,
  language: 'JavaScript'
};

export const mockTree = [
  { path: 'index.html', type: 'blob' },
  { path: 'README.md', type: 'blob' },
  { path: 'scripts/app.js', type: 'blob' },
  { path: 'scripts/commands.js', type: 'blob' },
  { path: 'scripts/github.js', type: 'blob' },
  { path: 'scripts/utils.js', type: 'blob' },
  { path: 'scripts/terminal.js', type: 'blob' },
  { path: 'scripts/config.js', type: 'blob' },
  { path: 'styles/main.css', type: 'blob' },
  { path: 'openspec/specs/commands/spec.md', type: 'blob' }
];

export const mockBranches = [
  { name: 'main', protected: true },
  { name: 'develop', protected: false },
  { name: 'feature/test', protected: false }
];

export const mockCommits = [
  { 
    sha: 'abc1234567890def', 
    commit: { 
      author: { name: 'Jerry', date: '2026-02-16T10:00:00Z' },
      message: 'Add find command' 
    } 
  },
  { 
    sha: 'def4567890123abc', 
    commit: { 
      author: { name: 'Jerry', date: '2026-02-15T08:00:00Z' },
      message: 'Add branch command' 
    } 
  }
];

export function createMockFetch(mockData = {}) {
  return vi.fn((url) => {
    if (url.includes('/repos/') && url.includes('/branches')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData.branches || mockBranches)
      });
    }
    if (url.includes('/git/trees/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tree: mockData.tree || mockTree })
      });
    }
    if (url.includes('/commits')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData.commits || mockCommits)
      });
    }
    if (url.includes('/repos/') && !url.includes('/contents')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData.repoInfo || mockRepoInfo)
      });
    }
    if (url.includes('/users/') || url.includes('/users/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData.repos || mockRepos)
      });
    }
    return Promise.resolve({ ok: false, status: 404 });
  });
}
