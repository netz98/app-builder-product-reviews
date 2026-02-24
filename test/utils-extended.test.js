/*
* Unit tests for extended utility functions in actions/utils.js
*/

const {
  encodeSkuForKey,
  decodeSkuFromKey,
  getParams,
  getOrgScopedKey
} = require('../actions/utils');

describe('encodeSkuForKey', () => {
  test('encodes lowercase to uppercase hex', () => {
    expect(encodeSkuForKey('abc')).toBe('414243');
  });

  test('encodes uppercase to same hex', () => {
    expect(encodeSkuForKey('ABC')).toBe('414243');
  });

  test('handles special characters', () => {
    expect(encodeSkuForKey('SKU-123')).toBe('534b552d313233');
  });

  test('handles numbers', () => {
    expect(encodeSkuForKey('12345')).toBe('3132333435');
  });

  test('encodes empty string', () => {
    expect(encodeSkuForKey('')).toBe('');
  });

  test('handles unicode characters', () => {
    const result = encodeSkuForKey('t');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  test('produces consistent encoding', () => {
    const sku = 'TEST-SKU-123';
    const result1 = encodeSkuForKey(sku);
    const result2 = encodeSkuForKey(sku);
    expect(result1).toBe(result2);
  });
});

describe('decodeSkuFromKey', () => {
  test('decodes hex back to original SKU (preserves case)', () => {
    expect(decodeSkuFromKey('414243')).toBe('ABC');
  });

  test('decodes hex back to original SKU (lowercase)', () => {
    expect(decodeSkuFromKey('414243')).toBe('ABC');
  });

  test('decodes hex back to original SKU (uppercase)', () => {
    expect(decodeSkuFromKey('414243')).toBe('ABC');
  });

  test('handles special characters correctly', () => {
    expect(decodeSkuFromKey('534b552d313233')).toBe('SKU-123');
  });

  test('handles numbers', () => {
    expect(decodeSkuFromKey('3132333435')).toBe('12345');
  });

  test('handles empty string', () => {
    expect(decodeSkuFromKey('')).toBe('');
  });

  test('handles odd-length hex strings', () => {
    const result = decodeSkuFromKey('41');
    expect(result).toBe('A');
  });
});

describe('getParams', () => {
  test('returns params directly when no __ow_body', () => {
    const input = { sku: 'test', rating: 5 };
    const result = getParams(input);
    expect(result).toEqual(input);
  });

  test('parses JSON from __ow_body', () => {
    const body = { sku: 'test', rating: 5 };
    const input = { __ow_body: JSON.stringify(body) };
    const result = getParams(input);
    expect(result).toEqual(body);
  });

  test('handles nested objects in __ow_body', () => {
    const body = { nested: { key: 'value' }, rating: 5 };
    const input = { __ow_body: JSON.stringify(body) };
    const result = getParams(input);
    expect(result).toEqual(body);
  });

  test('handles malformed JSON in __ow_body', () => {
    const input = { __ow_body: 'invalid json' };
    expect(() => getParams(input)).toThrow();
  });

  test('handles empty __ow_body', () => {
    const input = { __ow_body: '{}' };
    const result = getParams(input);
    expect(result).toEqual({});
  });

  test('handles array in __ow_body', () => {
    const body = [{ sku: 'test' }, { sku: 'test2' }];
    const input = { __ow_body: JSON.stringify(body) };
    const result = getParams(input);
    expect(result).toEqual(body);
  });

  test('preserves other params when __ow_body is present', () => {
    const input = {
      __ow_body: JSON.stringify({ sku: 'test' }),
      other_param: 'value'
    };
    const result = getParams(input);
    expect(result.sku).toBe('test');
  });
});

describe('getOrgScopedKey', () => {
  test('prefixes key with orgId when provided', () => {
    const result = getOrgScopedKey('test-key', 'org123');
    expect(result).toBe('org123_test-key');
  });

  test('returns key unchanged when orgId is null', () => {
    const result = getOrgScopedKey('test-key', null);
    expect(result).toBe('test-key');
  });

  test('returns key unchanged when orgId is empty string', () => {
    const result = getOrgScopedKey('test-key', '');
    expect(result).toBe('test-key');
  });

  test('returns key unchanged when orgId is undefined', () => {
    const result = getOrgScopedKey('test-key', undefined);
    expect(result).toBe('test-key');
  });

  test('handles special characters in orgId', () => {
    const result = getOrgScopedKey('test-key', 'org@test');
    expect(result).toBe('org@test_test-key');
  });

  test('handles special characters in key', () => {
    const result = getOrgScopedKey('test-key-123', 'org123');
    expect(result).toBe('org123_test-key-123');
  });
});
