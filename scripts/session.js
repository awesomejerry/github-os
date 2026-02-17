const GITHUB_OS_SESSION = 'github_os_session';
const GITHUB_OS_SESSIONS = 'github_os_sessions';

function getStorage() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage !== null) {
      return localStorage;
    }
  } catch (e) {
    // localStorage not available
  }
  return null;
}

export function saveSession(sessionData) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    const sessions = loadAllSessions();
    const existingIndex = sessions.findIndex(s => s.username === sessionData.username);
    
    const updatedSession = { ...sessionData, isActive: true };
    
    sessions.forEach(s => s.isActive = false);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = updatedSession;
    } else {
      sessions.push(updatedSession);
    }
    
    storage.setItem(GITHUB_OS_SESSION, JSON.stringify(updatedSession));
    storage.setItem(GITHUB_OS_SESSIONS, JSON.stringify(sessions));
    
    return true;
  } catch (e) {
    return false;
  }
}

export function loadSession() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const data = storage.getItem(GITHUB_OS_SESSION);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function loadAllSessions() {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const data = storage.getItem(GITHUB_OS_SESSIONS);
    if (!data) return [];
    
    const sessions = JSON.parse(data);
    return Array.isArray(sessions) ? sessions : [];
  } catch (e) {
    return [];
  }
}

export function clearSession() {
  const storage = getStorage();
  if (!storage) return false;

  try {
    const currentSession = loadSession();
    if (!currentSession) return true;
    
    const sessions = loadAllSessions();
    const filteredSessions = sessions.filter(s => s.username !== currentSession.username);
    
    storage.removeItem(GITHUB_OS_SESSION);
    
    if (filteredSessions.length > 0) {
      filteredSessions[0].isActive = true;
      storage.setItem(GITHUB_OS_SESSION, JSON.stringify(filteredSessions[0]));
      storage.setItem(GITHUB_OS_SESSIONS, JSON.stringify(filteredSessions));
    } else {
      storage.removeItem(GITHUB_OS_SESSIONS);
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

export function clearAllSessions() {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.removeItem(GITHUB_OS_SESSION);
    storage.removeItem(GITHUB_OS_SESSIONS);
    return true;
  } catch (e) {
    return false;
  }
}

export function switchAccount(username) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    const sessions = loadAllSessions();
    const targetSession = sessions.find(s => s.username === username);
    
    if (!targetSession) return false;
    
    sessions.forEach(s => s.isActive = (s.username === username));
    
    storage.setItem(GITHUB_OS_SESSION, JSON.stringify(targetSession));
    storage.setItem(GITHUB_OS_SESSIONS, JSON.stringify(sessions));
    
    return true;
  } catch (e) {
    return false;
  }
}

export function isAuthenticated() {
  const session = loadSession();
  return session !== null && !!session.accessToken;
}

export function getAccessToken() {
  const session = loadSession();
  return session ? session.accessToken : null;
}
