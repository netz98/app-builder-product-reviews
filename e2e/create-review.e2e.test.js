/*
* E2E tests for create-review endpoint
*/
const { Config } = require('@adobe/aio-sdk').Core;
const fetch = require('node-fetch');
const namespace = Config.get('runtime.namespace');
const hostname = Config.get('cna.hostname') || 'adobeioruntime.net';
const runtimePackage = 'review-app';
const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/create-review`;
const { getAuthHeaders } = require('./test-helper');

describe('create-review E2E', () => {
  it('returns 401 if missing authentication', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 if required fields are missing', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sku: 'sku1' })
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing required review fields/);
  });

  it('returns 400 if email is invalid', async () => {
    const review = {
      sku: 'sku-e2e',
      rating: 5,
      title: 'E2E Test',
      text: 'This is an E2E test review.',
      author: 'E2E Bot',
      author_email: 'invalid-email'
    };
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(review)
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid email/);
  });

  it('creates a review with all required fields', async () => {
    const review = {
      sku: `sku-e2e-${Date.now()}`,
      rating: 5,
      title: 'E2E Test',
      text: 'This is an E2E test review.',
      author: 'E2E Bot',
      author_email: 'e2e@example.com'
    };
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(review)
    });
    expect([200,201]).toContain(res.status);
    const body = await res.json();
    expect(body).toMatchObject({ sku: review.sku, title: review.title, author: review.author });
    expect(body.status).toBe('pending');
  });
});

