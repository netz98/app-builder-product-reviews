/**
 * Authentication utilities for Adobe Experience Cloud integration
 */

import { getShellAuth } from './auth/shellAuth'
import { getGuestAuth } from './auth/guestAuth'

export { getShellAuth, getGuestAuth }

export const getAuthHeaders = ({ ims, connection }) => {
    const shellAuth = getShellAuth(ims)
    if (shellAuth.token) {
        return { authorization: `Bearer ${shellAuth.token}`, 'x-gw-ims-org-id': shellAuth.orgId }
    }

    const guestAuth = getGuestAuth(connection)
    if (guestAuth.token) {
        return { authorization: `Bearer ${guestAuth.token}`, 'x-gw-ims-org-id': guestAuth.orgId }
    }

    return {}
}

export const hasAuthContext = ({ ims, connection }) => {
    const headers = getAuthHeaders({ ims, connection })
    return !!headers.authorization
}

/**
 * Check if authentication error indicates login is required
 * @param {Error|string} error - Error object or message
 * @returns {boolean} - true if error indicates auth failure
 */
export const isAuthenticationError = (error) => {
  let message = '';

  if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error.message === 'string') {
    message = error.message;
  } else if (error != null) {
    message = String(error);
  }

  const normalized = message.toLowerCase();
  return normalized.includes('authorization') ||
         normalized.includes('authentication') ||
         normalized.includes('unauthorized') ||
         normalized.includes('401');
};

/**
 * Handle authentication failure by redirecting to login
 * @param {Error|string} error - Error that occurred
 * @param {Function} setError - Function to set error state
 * @param {string} returnUrl - URL to return to after login
 */
export const handleAuthFailure = (error, setError = null) => {
  console.warn('Authentication failure detected:', error);
  
  // Only redirect if this is actually a 401 unauthorized error
  const is401Error = error?.status === 401 || 
                   error?.message?.includes('401') ||
                   error?.message?.includes('unauthorized');
  
  if (!is401Error) {
    console.debug('Not a 401 error, not redirecting');
    return;
  }
  
  // Set error message if provided
  if (setError) {
    setError('Auth required. Please sign in via the Adobe Admin Console.');
  }
  
  // Do not redirect; rely on shell context for auth
};
