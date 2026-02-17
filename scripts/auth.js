// GitHub OS - OAuth Authentication Module
// PKCE-based OAuth flow for GitHub (no Client Secret required)

import { saveSession } from './session.js';

const OAUTH_CONFIG = {
  clientId: 'Ov23liAdo8bSKYgsNNQ9',
  redirectUri: 'https://www.awesomejerry.space/github-os/callback.html',
  scope: 'repo user',
  authUrl: 'https://github.com/login/oauth/authorize',
  // Token exchange via Cloudflare Worker (to avoid CORS)
  // Deploy the worker from github-os-worker/ and update this URL
  tokenProxyUrl: 'https://github-os-token.angeljerry.workers.dev'
};

const PKCE_STATE_KEY = 'github_os_pkce_state';

/**
 * Generate cryptographically secure random string for PKCE code_verifier
 * @param {number} length - Length of the string (43-128)
 * @returns {string} Random string using [A-Za-z0-9-._~]
 */
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values)
    .map(x => charset[x % charset.length])
    .join('');
}

/**
 * Base64url encode (no padding, URL-safe)
 * @param {ArrayBuffer} buffer - Data to encode
 * @returns {string} Base64url encoded string
 */
function base64urlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate SHA256 hash
 * @param {string} message - String to hash
 * @returns {Promise<ArrayBuffer>} SHA256 hash
 */
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return crypto.subtle.digest('SHA-256', data);
}

/**
 * Generate PKCE code_verifier and code_challenge
 * @returns {Promise<{code_verifier: string, code_challenge: string}>}
 */
export async function generatePKCE() {
  // Generate code_verifier (43-128 chars)
  const codeVerifier = generateRandomString(64);
  
  // Generate code_challenge: base64url(SHA256(code_verifier))
  const hash = await sha256(codeVerifier);
  const codeChallenge = base64urlEncode(hash);
  
  return {
    code_verifier: codeVerifier,
    code_challenge: codeChallenge
  };
}

/**
 * Store PKCE state in localStorage
 * @param {string} codeVerifier 
 * @param {string} state - Random state for CSRF protection
 */
function storePKCEState(codeVerifier, state) {
  const pkceState = {
    code_verifier: codeVerifier,
    state: state,
    createdAt: Date.now()
  };
  localStorage.setItem(PKCE_STATE_KEY, JSON.stringify(pkceState));
}

/**
 * Retrieve PKCE state from localStorage
 * @returns {{code_verifier: string, state: string} | null}
 */
export function retrievePKCEState() {
  try {
    const data = localStorage.getItem(PKCE_STATE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Clear PKCE state from localStorage
 */
function clearPKCEState() {
  localStorage.removeItem(PKCE_STATE_KEY);
}

/**
 * Generate random state for CSRF protection
 * @returns {string}
 */
function generateState() {
  return generateRandomString(32);
}

/**
 * Initiate OAuth login flow
 * Redirects user to GitHub OAuth authorization page
 */
export async function initiateLogin() {
  // Generate PKCE parameters
  const { code_verifier, code_challenge } = await generatePKCE();
  const state = generateState();
  
  // Store PKCE state for callback
  storePKCEState(code_verifier, state);
  
  // Build authorization URL
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    scope: OAUTH_CONFIG.scope,
    response_type: 'code',
    code_challenge: code_challenge,
    code_challenge_method: 'S256',
    state: state
  });
  
  const authUrl = `${OAUTH_CONFIG.authUrl}?${params.toString()}`;
  
  // Redirect to GitHub
  window.location.href = authUrl;
}

/**
 * Handle OAuth callback
 * Should be called from callback.html
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for error in callback
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');
  if (error) {
    clearPKCEState();
    return {
      success: false,
      error: errorDescription || error
    };
  }
  
  // Get authorization code
  const code = urlParams.get('code');
  const returnedState = urlParams.get('state');
  
  if (!code) {
    clearPKCEState();
    return {
      success: false,
      error: 'No authorization code received'
    };
  }
  
  // Retrieve and validate PKCE state
  const pkceState = retrievePKCEState();
  if (!pkceState) {
    return {
      success: false,
      error: 'PKCE state not found. Please try logging in again.'
    };
  }
  
  // Validate state for CSRF protection
  if (returnedState && returnedState !== pkceState.state) {
    clearPKCEState();
    return {
      success: false,
      error: 'State mismatch. Possible CSRF attack.'
    };
  }
  
  try {
    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(code, pkceState.code_verifier);
    
    // Clear PKCE state (no longer needed)
    clearPKCEState();
    
    // Fetch user info
    const userInfo = await fetchUserInfo(tokenResponse.access_token);
    
    // Create session data
    const sessionData = {
      username: userInfo.login,
      accessToken: tokenResponse.access_token,
      tokenType: tokenResponse.token_type || 'bearer',
      scope: tokenResponse.scope || OAUTH_CONFIG.scope,
      createdAt: Date.now(),
      avatarUrl: userInfo.avatar_url,
      isActive: true
    };
    
    // Save session
    saveSession(sessionData);
    
    return { success: true };
  } catch (err) {
    clearPKCEState();
    return {
      success: false,
      error: err.message || 'Failed to complete login'
    };
  }
}

/**
 * Exchange authorization code for access token
 * Uses Cloudflare Worker proxy to avoid CORS issues
 * @param {string} code - Authorization code from GitHub
 * @param {string} codeVerifier - PKCE code_verifier
 * @returns {Promise<{access_token: string, token_type: string, scope: string}>}
 */
export async function exchangeCodeForToken(code, codeVerifier) {
  const response = await fetch(OAUTH_CONFIG.tokenProxyUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: code,
      code_verifier: codeVerifier,
      redirect_uri: OAUTH_CONFIG.redirectUri
    })
  });
  
  if (!response.ok) {
    throw new Error(`Token exchange failed: HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  
  return data;
}

/**
 * Validate access token by making authenticated request to GitHub
 * @param {string} token - Access token to validate
 * @returns {Promise<boolean>} True if token is valid
 */
export async function validateToken(token) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch {
    // Network error - return false but don't throw
    return false;
  }
}

/**
 * Fetch authenticated user information from GitHub
 * @param {string} token - Access token
 * @returns {Promise<{login: string, avatar_url: string, name?: string, html_url: string}>}
 */
export async function fetchUserInfo(token) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid or expired token');
    }
    throw new Error(`Failed to fetch user info: HTTP ${response.status}`);
  }
  
  return response.json();
}
