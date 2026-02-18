const GITHUB_OS_STAGING_KEY = 'github_os_staging';

function checkLocalStorage() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function getStagingData() {
  if (!checkLocalStorage()) {
    throw new Error('localStorage is not available');
  }
  
  try {
    const data = localStorage.getItem(GITHUB_OS_STAGING_KEY);
    if (!data) {
      return { creates: {}, updates: {}, deletes: {} };
    }
    
    const parsed = JSON.parse(data);
    return {
      creates: parsed.creates || {},
      updates: parsed.updates || {},
      deletes: parsed.deletes || {}
    };
  } catch (e) {
    return { creates: {}, updates: {}, deletes: {} };
  }
}

function saveStagingData(data) {
  if (!checkLocalStorage()) {
    throw new Error('localStorage is not available');
  }
  
  try {
    localStorage.setItem(GITHUB_OS_STAGING_KEY, JSON.stringify(data));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      throw new Error('localStorage quota exceeded. Please clear some staged changes.');
    }
    throw e;
  }
}

export function stageCreate(path, content) {
  const staging = getStagingData();
  
  if (staging.creates[path]) {
    throw new Error('Path already staged for creation');
  }
  
  if (staging.updates[path]) {
    throw new Error('Path already staged for update');
  }
  
  staging.creates[path] = { content };
  saveStagingData(staging);
}

export function stageUpdate(path, content, sha) {
  if (!sha) {
    throw new Error('SHA is required for updates');
  }
  
  const staging = getStagingData();
  
  if (staging.deletes[path]) {
    throw new Error('Path already staged for deletion');
  }
  
  staging.updates[path] = { content, sha };
  saveStagingData(staging);
}

export function stageDelete(path, sha) {
  if (!sha) {
    throw new Error('SHA is required for deletions');
  }
  
  const staging = getStagingData();
  
  if (staging.creates[path]) {
    delete staging.creates[path];
    saveStagingData(staging);
    return;
  }
  
  if (staging.updates[path]) {
    delete staging.updates[path];
  }
  
  staging.deletes[path] = { sha };
  saveStagingData(staging);
}

export function getStagedChanges() {
  return getStagingData();
}

export function clearStaging() {
  saveStagingData({ creates: {}, updates: {}, deletes: {} });
}

export function isStaged(path) {
  const staging = getStagingData();
  return !!(staging.creates[path] || staging.updates[path] || staging.deletes[path]);
}
