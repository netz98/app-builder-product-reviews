/*
* E2E tests for state-test endpoint
*/
const { Config } = require('@adobe/aio-sdk').Core;
const fetch = require('node-fetch');
const namespace = Config.get('runtime.namespace');
const hostname = Config.get('cna.hostname') || 'adobeioruntime.net';
const runtimePackage = 'review-app';
const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/state-test`;
const { getAuthHeaders } = require('./test-helper');

describe('state-test E2E', () => {
  it('returns 401 if missing authentication', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(res.status).toBe(401);
  });

  it('returns 200 and a results object with success for init, put, get, and delete', async () => {
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('init');
    expect(body).toHaveProperty('put');
    expect(body).toHaveProperty('get');
    expect(body).toHaveProperty('delete');
    expect(body.init).toMatch(/SUCCESS/);
    expect(body.put).toMatch(/SUCCESS/);
    expect(body.get).toMatch(/SUCCESS/);
    expect(body.delete).toMatch(/SUCCESS/);
  });
});

