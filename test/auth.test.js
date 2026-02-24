/*
* Unit tests for auth.js - Authentication middleware
*/

const { requireAuth } = require('../actions/auth');

describe('requireAuth', () => {
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn()
    };
  });

  test('returns success with valid auth headers', () => {
    const params = {
      __ow_headers: {
        authorization: 'Bearer token123',
        'x-gw-ims-org-id': 'org123',
        'x-gw-ims-user-id': 'user123'
      }
    };
    const result = requireAuth(params, mockLogger);

    expect(result.success).toBe(true);
    expect(result.authContext).toMatchObject({
      orgId: 'org123',
      userId: 'user123',
      authorization: 'Bearer token123',
      isAuthenticated: true
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Authenticated request from org: org123')
    );
  });

  test('returns error when authorization header is missing', () => {
    const params = {
      __ow_headers: {
        'x-gw-ims-org-id': 'org123'
      }
    };
    const result = requireAuth(params, mockLogger);

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      statusCode: 401,
      body: { error: 'Authentication required. Please provide valid Adobe credentials.' }
    });
    expect(mockLogger.info).toHaveBeenCalledWith('Authentication failed: missing headers');
  });

  test('returns error when x-gw-ims-org-id header is missing', () => {
    const params = {
      __ow_headers: {
        authorization: 'Bearer token123'
      }
    };
    const result = requireAuth(params, mockLogger);

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      statusCode: 401,
      body: { error: 'Authentication required. Please provide valid Adobe credentials.' }
    });
    expect(mockLogger.info).toHaveBeenCalledWith('Authentication failed: missing headers');
  });

  test('returns error when both auth headers are missing', () => {
    const params = {
      __ow_headers: {}
    };
    const result = requireAuth(params, mockLogger);

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      statusCode: 401,
      body: { error: 'Authentication required. Please provide valid Adobe credentials.' }
    });
  });

  test('returns error when __ow_headers is missing', () => {
    const params = {};
    const result = requireAuth(params, mockLogger);

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      statusCode: 401,
      body: { error: 'Authentication required. Please provide valid Adobe credentials.' }
    });
  });

  test('handles missing x-gw-ims-user-id gracefully', () => {
    const params = {
      __ow_headers: {
        authorization: 'Bearer token123',
        'x-gw-ims-org-id': 'org123'
      }
    };
    const result = requireAuth(params, mockLogger);

    expect(result.success).toBe(true);
    expect(result.authContext).toMatchObject({
      orgId: 'org123',
      userId: undefined,
      authorization: 'Bearer token123'
    });
  });

  test('handles Bearer token with different casing', () => {
    const params = {
      __ow_headers: {
        authorization: 'bearer token123',
        'x-gw-ims-org-id': 'org123'
      }
    };
    const result = requireAuth(params, mockLogger);

    expect(result.success).toBe(true);
    expect(result.authContext.authorization).toBe('bearer token123');
  });

  test('logs without error when logger is not provided', () => {
    const params = {
      __ow_headers: {
        authorization: 'Bearer token123',
        'x-gw-ims-org-id': 'org123'
      }
    };
    const result = requireAuth(params, null);

    expect(result.success).toBe(true);
    expect(result.authContext).toBeDefined();
  });
});
