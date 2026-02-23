import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

global.fetch = vi.fn();

vi.mock('../../scripts/session.js', () => ({
  loadSession: vi.fn(() => ({ username: 'testuser', accessToken: 'mock-token' })),
  isAuthenticated: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-token')
}));

const { 
  fetchNotifications, 
  markNotificationsRead, 
  fetchWorkflowRuns, 
  fetchWorkflowRun, 
  fetchWorkflowJobs,
  fetchWorkflowLogs,
  rerunWorkflow, 
  fetchWorkflows, 
  clearCache 
} = await import('../../scripts/github.js');

describe('Notifications Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
    clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchNotifications', () => {
    it('should fetch and format notifications', async () => {
      const mockNotifications = [
        {
          id: '1',
          unread: true,
          reason: 'subscribed',
          updated_at: '2026-02-23T10:00:00Z',
          repository: {
            full_name: 'owner/repo1',
            name: 'repo1',
            owner: { login: 'owner' }
          },
          subject: {
            title: 'Bug in login',
            type: 'Issue',
            url: 'https://api.github.com/repos/owner/repo1/issues/42'
          }
        },
        {
          id: '2',
          unread: false,
          reason: 'author',
          updated_at: '2026-02-22T10:00:00Z',
          repository: {
            full_name: 'owner/repo2',
            name: 'repo2',
            owner: { login: 'owner' }
          },
          subject: {
            title: 'PR merged',
            type: 'PullRequest',
            url: 'https://api.github.com/repos/owner/repo2/pulls/10'
          }
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotifications
      });

      const notifications = await fetchNotifications(false);
      
      expect(notifications).toHaveLength(2);
      expect(notifications[0].id).toBe('1');
      expect(notifications[0].unread).toBe(true);
      expect(notifications[0].repository.full_name).toBe('owner/repo1');
      expect(notifications[0].subject.title).toBe('Bug in login');
      expect(notifications[0].subject.type).toBe('Issue');
    });

    it('should pass all parameter for --all flag', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await fetchNotifications(true);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('all=true'),
        expect.any(Object)
      );
    });

    it('should cache notifications', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await fetchNotifications(false);
      await fetchNotifications(false);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle authentication error', async () => {
      const { isAuthenticated } = await import('../../scripts/session.js');
      isAuthenticated.mockReturnValueOnce(false);

      await expect(fetchNotifications(false)).rejects.toThrow('Authentication required');
    });
  });

  describe('markNotificationsRead', () => {
    it('should mark all notifications as read', async () => {
      fetch.mockResolvedValueOnce({
        ok: true
      });

      const result = await markNotificationsRead();
      
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/notifications',
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });

    it('should handle authentication error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(markNotificationsRead()).rejects.toThrow('Authentication required');
    });

    it('should handle permission denied', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(markNotificationsRead()).rejects.toThrow('Permission denied');
    });
  });
});

describe('Actions Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
    clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchWorkflowRuns', () => {
    it('should fetch and format workflow runs', async () => {
      const mockRuns = {
        workflow_runs: [
          {
            id: 123,
            name: 'CI',
            display_title: 'Add feature',
            status: 'completed',
            conclusion: 'success',
            head_branch: 'main',
            head_sha: 'abc1234567890def',
            event: 'push',
            created_at: '2026-02-23T10:00:00Z',
            updated_at: '2026-02-23T10:05:00Z',
            html_url: 'https://github.com/owner/repo/actions/runs/123',
            workflow_id: 1,
            run_number: 42,
            actor: { login: 'developer' }
          },
          {
            id: 124,
            name: 'Test',
            display_title: 'Fix bug',
            status: 'in_progress',
            conclusion: null,
            head_branch: 'feature/xyz',
            head_sha: 'def4567890abc',
            event: 'push',
            created_at: '2026-02-23T09:00:00Z',
            updated_at: '2026-02-23T09:30:00Z',
            html_url: 'https://github.com/owner/repo/actions/runs/124',
            workflow_id: 2,
            run_number: 15,
            actor: { login: 'contributor' }
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRuns
      });

      const runs = await fetchWorkflowRuns('owner', 'repo');
      
      expect(runs).toHaveLength(2);
      expect(runs[0].id).toBe(123);
      expect(runs[0].name).toBe('CI');
      expect(runs[0].status).toBe('completed');
      expect(runs[0].conclusion).toBe('success');
      expect(runs[0].branch).toBe('main');
      expect(runs[0].commit_sha).toBe('abc1234');
      expect(runs[0].run_number).toBe(42);
      expect(runs[1].status).toBe('in_progress');
    });

    it('should cache workflow runs', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ workflow_runs: [] })
      });

      await fetchWorkflowRuns('owner', 'repo');
      await fetchWorkflowRuns('owner', 'repo');

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle run not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(fetchWorkflowRuns('owner', 'nonexistent')).rejects.toThrow('Repository not found');
    });

    it('should require authentication', async () => {
      const { isAuthenticated } = await import('../../scripts/session.js');
      isAuthenticated.mockReturnValueOnce(false);

      await expect(fetchWorkflowRuns('owner', 'repo')).rejects.toThrow('Authentication required');
    });
  });

  describe('fetchWorkflowRun', () => {
    it('should fetch single workflow run details', async () => {
      const mockRun = {
        id: 123,
        name: 'CI',
        display_title: 'Add feature',
        status: 'completed',
        conclusion: 'success',
        head_branch: 'main',
        head_sha: 'abc1234567890def',
        event: 'push',
        created_at: '2026-02-23T10:00:00Z',
        updated_at: '2026-02-23T10:05:00Z',
        html_url: 'https://github.com/owner/repo/actions/runs/123',
        workflow_id: 1,
        run_number: 42,
        actor: { login: 'developer' },
        jobs_url: 'https://api.github.com/repos/owner/repo/actions/runs/123/jobs'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRun
      });

      const run = await fetchWorkflowRun('owner', 'repo', 123);
      
      expect(run.id).toBe(123);
      expect(run.name).toBe('CI');
      expect(run.status).toBe('completed');
      expect(run.conclusion).toBe('success');
      expect(run.branch).toBe('main');
      expect(run.actor).toBe('developer');
    });

    it('should handle run not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(fetchWorkflowRun('owner', 'repo', 999)).rejects.toThrow('Run not found');
    });
  });

  describe('fetchWorkflowJobs', () => {
    it('should fetch jobs for a workflow run', async () => {
      const mockJobs = {
        jobs: [
          {
            id: 1,
            name: 'build',
            status: 'completed',
            conclusion: 'success',
            started_at: '2026-02-23T10:00:00Z',
            completed_at: '2026-02-23T10:02:00Z',
            steps: [
              { name: 'Checkout', status: 'completed', conclusion: 'success', number: 1 },
              { name: 'Build', status: 'completed', conclusion: 'success', number: 2 }
            ]
          },
          {
            id: 2,
            name: 'test',
            status: 'completed',
            conclusion: 'failure',
            started_at: '2026-02-23T10:02:00Z',
            completed_at: '2026-02-23T10:05:00Z',
            steps: [
              { name: 'Checkout', status: 'completed', conclusion: 'success', number: 1 },
              { name: 'Test', status: 'completed', conclusion: 'failure', number: 2 }
            ]
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJobs
      });

      const jobs = await fetchWorkflowJobs('owner', 'repo', 123);
      
      expect(jobs).toHaveLength(2);
      expect(jobs[0].name).toBe('build');
      expect(jobs[0].status).toBe('completed');
      expect(jobs[0].conclusion).toBe('success');
      expect(jobs[0].steps).toHaveLength(2);
      expect(jobs[1].conclusion).toBe('failure');
    });
  });

  describe('fetchWorkflowLogs', () => {
    it('should fetch workflow logs', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Log line 1\nLog line 2\nLog line 3'
      });

      const logs = await fetchWorkflowLogs('owner', 'repo', 123);
      
      expect(logs).toBe('Log line 1\nLog line 2\nLog line 3');
    });

    it('should handle logs not available', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(fetchWorkflowLogs('owner', 'repo', 123)).rejects.toThrow('Logs not available');
    });
  });

  describe('rerunWorkflow', () => {
    it('should rerun a workflow', async () => {
      fetch.mockResolvedValueOnce({
        ok: true
      });

      const result = await rerunWorkflow('owner', 'repo', 123);
      
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/actions/runs/123/rerun',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should handle run not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(rerunWorkflow('owner', 'repo', 999)).rejects.toThrow('Run not found');
    });

    it('should handle validation error (422)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ message: 'Cannot rerun this workflow' })
      });

      await expect(rerunWorkflow('owner', 'repo', 123)).rejects.toThrow('Cannot rerun this workflow');
    });
  });

  describe('fetchWorkflows', () => {
    it('should fetch repository workflows', async () => {
      const mockWorkflows = {
        workflows: [
          {
            id: 1,
            name: 'CI',
            path: '.github/workflows/ci.yml',
            state: 'active',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-02-01T00:00:00Z',
            html_url: 'https://github.com/owner/repo/actions/workflows/ci.yml'
          },
          {
            id: 2,
            name: 'Deploy',
            path: '.github/workflows/deploy.yml',
            state: 'disabled_manually',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-02-01T00:00:00Z',
            html_url: 'https://github.com/owner/repo/actions/workflows/deploy.yml'
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkflows
      });

      const workflows = await fetchWorkflows('owner', 'repo');
      
      expect(workflows).toHaveLength(2);
      expect(workflows[0].name).toBe('CI');
      expect(workflows[0].state).toBe('active');
      expect(workflows[1].name).toBe('Deploy');
      expect(workflows[1].state).toBe('disabled_manually');
    });

    it('should cache workflows', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ workflows: [] })
      });

      await fetchWorkflows('owner', 'repo');
      await fetchWorkflows('owner', 'repo');

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle repository not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(fetchWorkflows('owner', 'nonexistent')).rejects.toThrow('Repository not found');
    });
  });
});
