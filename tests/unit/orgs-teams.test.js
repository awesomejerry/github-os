import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockResponses = new Map();

function setMockResponse(urlPattern, data) {
  mockResponses.set(urlPattern, data);
}

const originalFetch = global.fetch;

describe('Organizations & Teams API', () => {
  beforeEach(() => {
    vi.resetModules();
    mockResponses.clear();
    
    global.fetch = vi.fn(async (url) => {
      for (const [pattern, data] of mockResponses) {
        if (url.includes(pattern)) {
          if (data instanceof Error) {
            return Promise.resolve({ ok: false, status: 404 });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(data),
            headers: new Headers()
          });
        }
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('fetchUserOrgs', () => {
    it('should fetch and format user organizations', async () => {
      const mockOrgs = [
        { login: 'github', name: 'GitHub', description: 'How people build software', avatar_url: 'https://github.com/github.png', html_url: 'https://github.com/github', public_repos: 100 },
        { login: 'microsoft', name: 'Microsoft', description: 'Open source, of course', avatar_url: 'https://github.com/microsoft.png', html_url: 'https://github.com/microsoft', public_repos: 200 }
      ];
      setMockResponse('/user/orgs', mockOrgs);

      const { fetchUserOrgs, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const orgs = await fetchUserOrgs();
      
      expect(orgs).toHaveLength(2);
      expect(orgs[0].login).toBe('github');
      expect(orgs[0].name).toBe('GitHub');
      expect(orgs[1].login).toBe('microsoft');
    });

    it('should cache organization results', async () => {
      setMockResponse('/user/orgs', []);
      
      const { fetchUserOrgs, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      await fetchUserOrgs();
      await fetchUserOrgs();
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchOrgInfo', () => {
    it('should fetch and format organization info', async () => {
      const mockOrgInfo = {
        login: 'github',
        name: 'GitHub',
        description: 'How people build software',
        location: 'San Francisco, CA',
        blog: 'https://github.blog',
        email: 'support@github.com',
        public_repos: 100,
        followers: 5000,
        following: 10,
        created_at: '2008-01-01T00:00:00Z',
        html_url: 'https://github.com/github',
        avatar_url: 'https://github.com/github.png'
      };
      setMockResponse('/orgs/github', mockOrgInfo);

      const { fetchOrgInfo, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const info = await fetchOrgInfo('github');
      
      expect(info.login).toBe('github');
      expect(info.name).toBe('GitHub');
      expect(info.public_repos).toBe(100);
      expect(info.location).toBe('San Francisco, CA');
    });

    it('should throw error for non-existent org', async () => {
      setMockResponse('/orgs/nonexistent', { error: 'Not Found' });
      
      global.fetch = vi.fn(async () => ({
        ok: false,
        status: 404
      }));

      const { fetchOrgInfo, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      await expect(fetchOrgInfo('nonexistent')).rejects.toThrow('Organization not found');
    });
  });

  describe('fetchOrgRepos', () => {
    it('should fetch and format organization repos', async () => {
      const mockRepos = [
        { name: 'actions', description: 'GitHub Actions', stargazers_count: 1000, forks_count: 200, language: 'TypeScript', private: false, html_url: 'https://github.com/github/actions' },
        { name: 'docs', description: 'GitHub Docs', stargazers_count: 500, forks_count: 1000, language: 'JavaScript', private: false, html_url: 'https://github.com/github/docs' }
      ];
      setMockResponse('/orgs/github/repos', mockRepos);

      const { fetchOrgRepos, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const repos = await fetchOrgRepos('github');
      
      expect(repos).toHaveLength(2);
      expect(repos[0].name).toBe('actions');
      expect(repos[0].stars).toBe(1000);
      expect(repos[1].language).toBe('JavaScript');
    });
  });

  describe('fetchOrgTeams', () => {
    it('should fetch and format organization teams', async () => {
      const mockTeams = [
        { name: 'Engineering', slug: 'engineering', description: 'Engineering team', members_count: 100, repos_count: 50, privacy: 'closed', html_url: 'https://github.com/orgs/github/teams/engineering' },
        { name: 'Design', slug: 'design', description: 'Design team', members_count: 20, repos_count: 10, privacy: 'closed', html_url: 'https://github.com/orgs/github/teams/design' }
      ];
      setMockResponse('/orgs/github/teams', mockTeams);

      const { fetchOrgTeams, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const teams = await fetchOrgTeams('github');
      
      expect(teams).toHaveLength(2);
      expect(teams[0].slug).toBe('engineering');
      expect(teams[0].members_count).toBe(100);
      expect(teams[1].slug).toBe('design');
    });
  });

  describe('fetchTeamRepos', () => {
    it('should fetch and format team repos', async () => {
      const mockRepos = [
        { name: 'actions', description: 'Actions', language: 'TypeScript', private: false, permissions: { admin: false, push: true }, html_url: 'https://github.com/github/actions' },
        { name: 'docs', description: 'Docs', language: 'JavaScript', private: true, permissions: { admin: true, push: true }, html_url: 'https://github.com/github/docs' }
      ];
      setMockResponse('/teams/engineering/repos', mockRepos);

      const { fetchTeamRepos, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const repos = await fetchTeamRepos('github', 'engineering');
      
      expect(repos).toHaveLength(2);
      expect(repos[0].name).toBe('actions');
      expect(repos[0].permissions.push).toBe(true);
      expect(repos[1].permissions.admin).toBe(true);
    });
  });

  describe('fetchTeamMembers', () => {
    it('should fetch and format team members', async () => {
      const mockMembers = [
        { login: 'user1', avatar_url: 'https://github.com/user1.png', html_url: 'https://github.com/user1', type: 'User' },
        { login: 'user2', avatar_url: 'https://github.com/user2.png', html_url: 'https://github.com/user2', type: 'User' }
      ];
      setMockResponse('/teams/engineering/members', mockMembers);

      const { fetchTeamMembers, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const members = await fetchTeamMembers('github', 'engineering');
      
      expect(members).toHaveLength(2);
      expect(members[0].login).toBe('user1');
      expect(members[1].login).toBe('user2');
    });
  });
});

describe('cmdOrg Command Signature', () => {
  it('should be registered in commands', async () => {
    const { commands } = await import('../../scripts/commands.js');
    expect(commands.org).toBeInstanceOf(Function);
    expect(commands.org.length).toBeGreaterThanOrEqual(3);
  });
});

describe('cmdTeams Command Signature', () => {
  it('should be registered in commands', async () => {
    const { commands } = await import('../../scripts/commands.js');
    expect(commands.teams).toBeInstanceOf(Function);
    expect(commands.teams.length).toBeGreaterThanOrEqual(3);
  });
});

describe('cmdTeam Command Signature', () => {
  it('should be registered in commands', async () => {
    const { commands } = await import('../../scripts/commands.js');
    expect(commands.team).toBeInstanceOf(Function);
    expect(commands.team.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Commands Registry', () => {
  it('should include org, teams, and team commands', async () => {
    const { commands } = await import('../../scripts/commands.js');
    expect(commands.org).toBeDefined();
    expect(commands.teams).toBeDefined();
    expect(commands.team).toBeDefined();
  });
});
