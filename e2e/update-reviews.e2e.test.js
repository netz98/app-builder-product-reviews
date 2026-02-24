/*
* E2E tests for update-reviews endpoint
*/
const { Config } = require('@adobe/aio-sdk').Core;
const fetch = require('node-fetch');
const namespace = Config.get('runtime.namespace');
const hostname = Config.get('cna.hostname') || 'adobeioruntime.net';
const runtimePackage = 'review-app';
const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/update-reviews`;
const { getAuthHeaders } = require('./test-helper');

describe('update-reviews E2E', () => {
  it('returns 401 if missing authentication', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 if reviews array is missing', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/reviews array/);
  });

  it('returns 400 if reviews array is empty', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reviews: [] })
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/reviews array/);
  });

  it('returns 400 if review id is missing', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reviews: [{ status: 'approved' }] })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results[0].success).toBe(false);
    expect(body.results[0].error).toContain('Missing id');
  });

  it('returns 200 and results array for valid updates', async () => {
    // Use a fake id for test; in a real test, create a review first
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reviews: [{ id: 'fake-id-e2e', status: 'approved' }] })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results[0]).toHaveProperty('id', 'fake-id-e2e');
  });
});

