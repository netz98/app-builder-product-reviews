/*
* E2E tests for delete-reviews-by-ids endpoint
*/
const { Config } = require('@adobe/aio-sdk').Core;
const fetch = require('node-fetch');
const namespace = Config.get('runtime.namespace');
const hostname = Config.get('cna.hostname') || 'adobeioruntime.net';
const runtimePackage = 'review-app';
const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/delete-reviews-by-ids`;
const { getAuthHeaders } = require('./test-helper');

describe('delete-reviews-by-ids E2E', () => {
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

  it('returns 400 if ids is not an array', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: 'not-an-array' })
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/ids array/);
  });

  it('returns 200 and results array for valid ids', async () => {
    // Use a fake id for test; in a real test, create a review first
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: ['fake-id-e2e'] })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results[0]).toHaveProperty('id', 'fake-id-e2e');
  });
});

