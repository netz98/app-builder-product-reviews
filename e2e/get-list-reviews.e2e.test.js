/*
* E2E tests for get-list-reviews endpoint
*/
const { Config } = require('@adobe/aio-sdk').Core;
const fetch = require('node-fetch');
const namespace = Config.get('runtime.namespace');
const hostname = Config.get('cna.hostname') || 'adobeioruntime.net';
const runtimePackage = 'review-app';
const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/get-list-reviews`;
const { getAuthHeaders } = require('./test-helper');

describe('get-list-reviews E2E', () => {
  it('returns 401 if missing authentication', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(res.status).toBe(401);
  });

  it('returns 200 and an array of reviews', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('filters reviews by status', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: 'pending' })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('filters reviews by SKU', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sku: 'test-sku' })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

