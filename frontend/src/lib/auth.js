// User management (tokens are now handled via httpOnly cookies)

export function setUser(user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function clearUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

export function isAuthenticated() {
  return !!getUser();
}

// Legacy functions for backward compatibility (no longer store tokens client-side)
export function setAuthTokens() {
  // Tokens are now handled via httpOnly cookies - this is a no-op
  console.warn('setAuthTokens is deprecated - tokens are now managed via httpOnly cookies');
}

export function getAccessToken() {
  // Tokens are now handled via httpOnly cookies
  return null;
}

export function getRefreshToken() {
  // Tokens are now handled via httpOnly cookies
  return null;
}

export function clearAuthTokens() {
  clearUser();
}
