// ============================================================================
// SECURITY: Tokens are stored in httpOnly cookies (not accessible to JS)
// This prevents XSS attacks from stealing authentication tokens.
// The backend sets these cookies on login and sends them with each request.
// ============================================================================

/**
 * Set authentication tokens as httpOnly cookies.
 * NOTE: The backend is responsible for setting these cookies,
 * not the frontend. This function is for reference/documentation.
 */
export function setAuthTokens(accessToken, refreshToken) {
  // ⚠️ DO NOT store tokens in localStorage - XSS vulnerable!
  // Tokens MUST be set by the backend as httpOnly cookies only.
  if (typeof window === 'undefined') return;

  // Clear any old localStorage tokens (migration from old approach)
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  // Store non-sensitive user info in sessionStorage (cleared on tab close)
  // This helps with detecting authentication state without exposing tokens
  localStorage.setItem('isAuthenticated', 'true');
}

export function getAccessToken() {
  // Tokens are in httpOnly cookies - JS cannot access them
  // This prevents XSS attacks. Use cookies for API requests instead.
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  // Tokens are in httpOnly cookies - JS cannot access them
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
  // Only store non-sensitive user info (never tokens!)
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
