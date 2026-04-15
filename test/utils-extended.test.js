/*
 * Unit tests for additional utility behavior in actions/utils.js
 */

const {
  getParams,
  getOrgScopedKey,
  stringParameters
} = require('../actions/utils');

describe('getParams', () => {
  test('returns params directly when no __ow_body exists', () => {
    const input = { sku: 'test', rating: 5 };
    expect(getParams(input)).toEqual(input);
  });

  test('parses JSON from __ow_body', () => {
    const body = { sku: 'test', rating: 5 };
    expect(getParams({ __ow_body: JSON.stringify(body) })).toEqual(body);
  });

  test('returns original params when __ow_body is malformed JSON', () => {
    const input = { __ow_body: 'invalid json', other_param: 'value' };
    expect(getParams(input)).toEqual(input);
  });

  test('supports array payloads in __ow_body', () => {
    const body = [{ sku: 'test' }, { sku: 'test2' }];
    expect(getParams({ __ow_body: JSON.stringify(body) })).toEqual(body);
  });
});

describe('getOrgScopedKey', () => {
  test('prefixes key with orgId when provided', () => {
    expect(getOrgScopedKey('test-key', 'org123')).toBe('org123_test-key');
  });

  test('returns key unchanged when orgId is falsy', () => {
    expect(getOrgScopedKey('test-key', null)).toBe('test-key');
    expect(getOrgScopedKey('test-key', '')).toBe('test-key');
    expect(getOrgScopedKey('test-key', undefined)).toBe('test-key');
  });
});

describe('stringParameters', () => {
  test('redacts authorization header only', () => {
    const params = {
      sku: 'SKU-1',
      __ow_headers: {
        authorization: 'Bearer secret-token',
        'x-gw-ims-org-id': 'org123'
      }
    };

    expect(stringParameters(params)).toContain('"authorization":"<hidden>"');
    expect(stringParameters(params)).toContain('"x-gw-ims-org-id":"org123"');
    expect(stringParameters(params)).not.toContain('secret-token');
  });
});
