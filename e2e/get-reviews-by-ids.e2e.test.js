/*
* E2E tests for get-reviews-by-ids endpoint
*/
const { Config } = require('@adobe/aio-sdk').Core;
const fetch = require('node-fetch');
const namespace = Config.get('runtime.namespace');
const hostname = Config.get('cna.hostname') || 'adobeioruntime.net';
const runtimePackage = 'review-app';
const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/get-reviews-by-ids`;
const { getAuthHeaders } = require('./test-helper');

describe('get-reviews-by-ids E2E', () => {
  it('returns 401 if missing authentication', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 if ids is missing', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/ids array/);
  });

  it('returns 400 if ids is empty array', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: [] })
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/ids array/);
  });

  it('returns 200 and array for valid ids', async () => {
    // Use a fake ids for test; in a real test, create a review first
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: ['fake-id-e2e'] })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
