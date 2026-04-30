export function setAuthTokens(accessToken, refreshToken) {
  if (typeof window === 'undefined') return;

  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  localStorage.setItem('isAuthenticated', 'true');
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
}

export function setUser(user) {
  if (typeof window === 'undefined') return;
  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    permissions: user.permissions,
  };
  localStorage.setItem('user', JSON.stringify(safeUser));
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAuthenticated') === 'true';
}
