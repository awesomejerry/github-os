// GitHub OS - Staging Area Module

const STORAGE_KEY = 'github_os_staging';

function loadStaging() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        creates: parsed.creates || {},
        updates: parsed.updates || {},
        deletes: parsed.deletes || {}
      };
    }
  } catch {
    // ignore errors
  }
  return { creates: {}, updates: {}, deletes: {} };
}

function saveStaging(staging) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staging));
  } catch {
    // ignore errors
  }
}

export function getStagedChanges() {
  const staging = loadStaging();
  return {
    creates: Object.entries(staging.creates).map(([path, content]) => ({
      path,
      content
    })),
    updates: Object.entries(staging.updates).map(([path, data]) => ({
      path,
      content: data.content,
      sha: data.sha
    })),
    deletes: Object.entries(staging.deletes).map(([path, sha]) => ({
      path,
      sha
    }))
  };
}

export function stageCreate(path, content) {
  const staging = loadStaging();
  
  if (staging.deletes[path]) {
    staging.deletes[path] = undefined;
    delete staging.deletes[path];
  }
  
  if (staging.updates[path]) {
    staging.updates[path] = undefined;
    delete staging.updates[path];
  }
  
  staging.creates[path] = content;
  saveStaging(staging);
}

export function stageUpdate(path, content, sha) {
  const staging = loadStaging();
  
  if (staging.deletes[path]) {
    staging.deletes[path] = undefined;
    delete staging.deletes[path];
  }
  
  if (staging.creates[path]) {
    staging.creates[path] = content;
  } else {
    staging.updates[path] = { content, sha };
  }
  
  saveStaging(staging);
}

export function stageDelete(path, sha) {
  const staging = loadStaging();
  
  if (staging.creates[path]) {
    staging.creates[path] = undefined;
    delete staging.creates[path];
    saveStaging(staging);
    return;
  }
  
  if (staging.updates[path]) {
    staging.updates[path] = undefined;
    delete staging.updates[path];
  }
  
  staging.deletes[path] = sha;
  saveStaging(staging);
}

export function unstage(path) {
  const staging = loadStaging();
  
  if (staging.creates[path]) {
    staging.creates[path] = undefined;
    delete staging.creates[path];
  }
  
  if (staging.updates[path]) {
    staging.updates[path] = undefined;
    delete staging.updates[path];
  }
  
  if (staging.deletes[path]) {
    staging.deletes[path] = undefined;
    delete staging.deletes[path];
  }
  
  saveStaging(staging);
}

export function clearStaging() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasStagedChanges() {
  const staging = loadStaging();
  return (
    Object.keys(staging.creates).length > 0 ||
    Object.keys(staging.updates).length > 0 ||
    Object.keys(staging.deletes).length > 0
  );
}
