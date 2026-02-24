/*
* E2E Test Helper - Provides common utilities for E2E tests
*/

const { Config } = require('@adobe/aio-sdk').Core;

module.exports = {
  getAuthHeaders: () => {
    const namespace = Config.get('runtime.namespace');
    const auth = Config.get('runtime.auth');

    if (!auth) {
      console.warn('WARNING: No runtime.auth configured. Tests will fail.');
      console.warn('To run E2E tests, configure runtime.auth in .env or aio app use');
      return {
        'Content-Type': 'application/json',
        'x-gw-ims-org-id': namespace || 'test-org'
      };
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth}`,
      'x-gw-ims-org-id': namespace || 'test-org'
    };
  }
};

describe('test-helper', () => {
  it('returns headers with auth when configured', () => {
    const originalAuth = Config.get('runtime.auth');
    const result = module.exports.getAuthHeaders();
    if (originalAuth) {
      expect(result).toEqual({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${originalAuth}`,
        'x-gw-ims-org-id': Config.get('runtime.namespace') || 'test-org'
      });
    }
  });

  it('returns headers without auth when not configured', () => {
    Config.set('runtime.auth', null);
    const result = module.exports.getAuthHeaders();
    expect(result).toEqual({
      'Content-Type': 'application/json',
      'x-gw-ims-org-id': Config.get('runtime.namespace') || 'test-org'
    });
    expect(result).not.toHaveProperty('Authorization');
    Config.set('runtime.auth', undefined);
  });
});
