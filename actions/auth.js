/*
 * Simple Adobe App Builder Authentication Middleware
 * Provides basic authentication validation for Product Reviews App
 */

/**
 * Validates that Adobe authentication is present
 * When require-adobe-auth: true is set, Adobe injects:
 * - x-gw-ims-org-id: Organization ID
 * - x-gw-ims-user-id: User ID (when applicable)  
 * - authorization: Bearer token (validated by Adobe)
 * 
 * @param {object} params - Action parameters containing __ow_headers
 * @param {object} logger - Logger instance
 * @returns {object} { success: boolean, authContext?: object, error?: object }
 */
function requireAuth(params, logger) {
  const headers = params.__ow_headers || {};
  
  // Check if Adobe auth headers are present
  if (!headers.authorization || !headers['x-gw-ims-org-id']) {
    const errorMessage = 'Authentication required. Please provide valid Adobe credentials.';
    if (logger && typeof logger.info === 'function') {
      logger.info(`Authentication failed: missing headers`);
    }
    return {
      success: false,
      error: {
        statusCode: 401,
        body: { error: errorMessage }
      }
    };
  }
  
  const authContext = {
    orgId: headers['x-gw-ims-org-id'],
    userId: headers['x-gw-ims-user-id'], 
    authorization: headers.authorization,
    isAuthenticated: true
  };
  
  if (logger && typeof logger.info === 'function') {
    logger.info(`Authenticated request from org: ${authContext.orgId}, user: ${authContext.userId}`);
  }
  
  return { 
    success: true, 
    authContext 
  };
}

module.exports = {
  requireAuth
};
