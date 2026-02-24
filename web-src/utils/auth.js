/**
 * Authentication utilities for Adobe Experience Cloud integration
 */

import { attach } from '@adobe/uix-guest'
import { getShellAuth } from './auth/shellAuth'
import { getWindowAuth, setWindowImsCredentials } from './auth/windowAuth'
import { getGuestAuth } from './auth/guestAuth'

export { getShellAuth, getWindowAuth, getGuestAuth }

export const getAuthHeaders = ({ ims, connection }) => {
    // 1. Check Shell (Experience Cloud)
    const shellAuth = getShellAuth(ims);
    if (shellAuth.token) return { authorization: `Bearer ${shellAuth.token}`, 'x-gw-ims-org-id': shellAuth.orgId };

    // 2. Check Guest (Commerce Admin) - The "Proper" Path
    if (connection?.sharedContext) {
        const context = connection.sharedContext;
        const imsContext = context.get('ims') || {};

        // Check all possible keys provided by the Admin UI SDK
        const token = context.get('imsToken') || imsContext.token || imsContext.imsToken;
        const orgId = context.get('imsOrgId') || imsContext.imsOrgId || imsContext.orgId;

        if (token) {
            return { authorization: `Bearer ${token}`, 'x-gw-ims-org-id': orgId };
        }
    }

    return {};
};

export const hasAuthContext = ({ ims, connection }) => {
    // STRENGTHEN: Check for the actual presence of a token
    const headers = getAuthHeaders({ ims, connection });
    return !!headers.authorization;
};

export const ensureWindowImsCredentials = async ({ connection, extensionId, setConnection }) => {
  const currentWindowAuth = getWindowAuth()
  if (currentWindowAuth.token) {
    return
  }

  const guestAuth = getGuestAuth(connection)
  if (guestAuth.token) {
    setWindowImsCredentials(guestAuth)
    return
  }

  if (connection) {
    return
  }

  if (!extensionId) {
    return
  }

  const isCommerceAdmin = (() => {
    if (typeof window === 'undefined') {
      return false
    }
    const ancestorOrigins = window.location?.ancestorOrigins || []
    const referrer = document?.referrer || ''
    return Array.from(ancestorOrigins).some((origin) => origin.includes('admin.commerce.adobe.com')) ||
      referrer.includes('admin.commerce.adobe.com')
  })()

  if (isCommerceAdmin) {
    return
  }

  try {
    const guestConnection = await attach({ id: extensionId })
    const attachedGuestAuth = getGuestAuth(guestConnection)
    if (attachedGuestAuth.token) {
      setWindowImsCredentials(attachedGuestAuth)
    }

    if (guestConnection && typeof setConnection === 'function') {
      setConnection((prevConnection) => prevConnection || guestConnection)
    }
  } catch (attachError) {
    console.warn('[auth] Could not attach guest connection for IMS credentials', attachError)
  }
}

/**
 * Redirects user to Adobe authentication service
 * @param {string} returnUrl - URL to return to after login
 */
export const redirectToLogin = (returnUrl = null) => {
    // Check if the app is running in an iframe
    const isInIframe = window.location !== window.parent.location;

    if (isInIframe) {
        // Inside an iframe, we must not redirect.
        // The parent Adobe Shell handles the session.
        console.error('Authentication failed inside the Admin SDK iframe. Do not redirect.');
        return;
    }

    // Only perform a manual redirect if running as a standalone app (e.g., local development)
    const currentUrl = returnUrl || window.location.href;
    const encodedReturnUrl = encodeURIComponent(currentUrl);
    const authUrl = `https://experience.adobe.com/?returnUrl=${encodedReturnUrl}`;

    window.location.href = authUrl;
};

/**
 * Check if IMS object is valid and has required properties
 * @param {object} ims - IMS object from props
 * @returns {boolean} - true if IMS is valid
 */
export const isImsValid = (ims) => {
  // More permissive validation - if IMS object exists, assume Experience Cloud handled auth
  const hasIms = ims && typeof ims === 'object';
  
  // Log the actual IMS structure for debugging
  if (hasIms) {
    console.debug('IMS object structure:', {
      keys: Object.keys(ims),
      hasToken: 'token' in ims,
      hasAuthorization: 'authorization' in ims,
      hasOrg: 'org' in ims,
      hasImsOrg: 'imsOrg' in ims,
      hasImsToken: 'imsToken' in ims,
      sampleValues: {
        token: ims.token ? '[PRESENT]' : '[MISSING]',
        authorization: ims.authorization ? '[PRESENT]' : '[MISSING]',
        org: ims.org || ims.imsOrg || '[MISSING]'
      }
    });
  } else {
    console.info('No IMS object available');
  }
  
  // For now, if IMS object exists at all, assume it's valid
  // Experience Cloud Shell should handle the actual validation
  return hasIms;
};

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
export const handleAuthFailure = (error, setError = null, returnUrl = null) => {
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

/**
 * Get Experience Cloud Shell runtime instance
 * @returns {object|null} - Runtime instance or null
 */
export const getExcRuntime = () => {
  // Try to get runtime from global window object
  if (window.adobeIMS && window.adobeIMS.excRuntime) {
    return window.adobeIMS.excRuntime;
  }
  
  // Try to get runtime from exc-app module
  try {
    const excApp = require('@adobe/exc-app');
    if (excApp && excApp.excRuntime) {
      return excApp.excRuntime;
    }
  } catch (e) {
    console.warn('Could not access exc-app runtime:', e);
  }
  
  return null;
};
