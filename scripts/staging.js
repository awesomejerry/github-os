const STAGING_KEY = 'github_os_staged_changes';

export function getStagedChanges() {
  try {
    const data = localStorage.getItem(STAGING_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStagedChanges(changes) {
  localStorage.setItem(STAGING_KEY, JSON.stringify(changes));
}

export function stageCreate(owner, repo, path, content = '') {
  const fullPath = `${owner}/${repo}/${path}`;
  const changes = getStagedChanges();
  
  const existingIndex = changes.findIndex(c => c.path === fullPath);
  if (existingIndex >= 0) {
    changes[existingIndex] = {
      type: 'create',
      path: fullPath,
      content: btoa(unescape(encodeURIComponent(content))),
      timestamp: Date.now()
    };
  } else {
    changes.push({
      type: 'create',
      path: fullPath,
      content: btoa(unescape(encodeURIComponent(content))),
      timestamp: Date.now()
    });
  }
  
  saveStagedChanges(changes);
}

export function stageUpdate(owner, repo, path, content, sha) {
  const fullPath = `${owner}/${repo}/${path}`;
  const changes = getStagedChanges();
  
  const existingIndex = changes.findIndex(c => c.path === fullPath);
  if (existingIndex >= 0) {
    changes[existingIndex] = {
      type: 'update',
      path: fullPath,
      content: btoa(unescape(encodeURIComponent(content))),
      sha: sha,
      timestamp: Date.now()
    };
  } else {
    changes.push({
      type: 'update',
      path: fullPath,
      content: btoa(unescape(encodeURIComponent(content))),
      sha: sha,
      timestamp: Date.now()
    });
  }
  
  saveStagedChanges(changes);
}

export function stageDelete(owner, repo, path, sha) {
  const fullPath = `${owner}/${repo}/${path}`;
  const changes = getStagedChanges();
  
  const existingIndex = changes.findIndex(c => c.path === fullPath);
  if (existingIndex >= 0) {
    changes[existingIndex] = {
      type: 'delete',
      path: fullPath,
      sha: sha,
      timestamp: Date.now()
    };
  } else {
    changes.push({
      type: 'delete',
      path: fullPath,
      sha: sha,
      timestamp: Date.now()
    });
  }
  
  saveStagedChanges(changes);
}

export function unstageFile(path) {
  const changes = getStagedChanges();
  const filtered = changes.filter(c => c.path !== path);
  saveStagedChanges(filtered);
  return changes.length !== filtered.length;
}

export function clearStaging() {
  const changes = getStagedChanges();
  const count = changes.length;
  localStorage.removeItem(STAGING_KEY);
  return count;
}

export async function commitStaged(token, message, owner, repo) {
  const changes = getStagedChanges();
  
  if (changes.length === 0) {
    return { success: false, error: 'Nothing to commit' };
  }
  
  const results = [];
  
  for (const change of changes) {
    try {
      let response;
      
      if (change.type === 'create') {
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${change.path.split('/').slice(2).join('/')}`,
          {
            method: 'PUT',
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: message,
              content: change.content
            })
          }
        );
      } else if (change.type === 'update') {
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${change.path.split('/').slice(2).join('/')}`,
          {
            method: 'PUT',
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: message,
              content: change.content,
              sha: change.sha
            })
          }
        );
      } else if (change.type === 'delete') {
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${change.path.split('/').slice(2).join('/')}`,
          {
            method: 'DELETE',
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: message,
              sha: change.sha
            })
          }
        );
      }
      
      if (response && response.ok) {
        results.push({ path: change.path, success: true });
      } else {
        const errorData = response ? await response.json() : {};
        results.push({ path: change.path, success: false, error: errorData.message || 'API error' });
      }
    } catch (error) {
      results.push({ path: change.path, success: false, error: error.message });
    }
  }
  
  const allSuccess = results.every(r => r.success);
  if (allSuccess) {
    clearStaging();
    return { success: true, results, count: results.length };
  }
  
  const successPaths = results.filter(r => r.success).map(r => r.path);
  const remainingChanges = changes.filter(c => !successPaths.includes(c.path));
  saveStagedChanges(remainingChanges);
  
  return { success: false, results, error: 'Some commits failed' };
}
