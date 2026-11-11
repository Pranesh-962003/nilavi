// Admin API helper: adds the session token to every request and signs the
// user out as soon as the server says the session is no longer valid.

const TOKEN_KEY = 'nilavi_admin_token';

let unauthorizedHandler = null;

export const getAdminToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setAdminToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
};

export const clearAdminToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export async function adminFetch(url, options = {}) {
  const token = getAdminToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearAdminToken();
    if (unauthorizedHandler) unauthorizedHandler();
  }
  return res;
}

// Ask the server whether the stored token is still a live session
export async function verifyAdminSession() {
  if (!getAdminToken()) return null;
  try {
    const res = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${getAdminToken()}` }
    });
    if (!res.ok) {
      clearAdminToken();
      return null;
    }
    const data = await res.json();
    return data.user || { username: 'admin', role: 'admin' };
  } catch {
    // Server unreachable: keep the token, but there is no confirmed session
    return null;
  }
}

export async function logoutAdmin() {
  const token = getAdminToken();
  clearAdminToken();
  if (!token) return;
  try {
    await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  } catch {
    /* already signed out locally */
  }
}
