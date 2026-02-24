const { StateRepository } = require('../storage-repository');
const { Core } = require('@adobe/aio-sdk');
const { getParams, errorResponse } = require('../utils');
const { requireAuth } = require('../auth');

async function main(params) {
  const logger = Core.Logger('get-reviews-by-ids', { level: params.LOG_LEVEL || 'warn' });
  
  // AUTHENTICATION CHECK
  const authResult = requireAuth(params, logger);
  if (!authResult.success) {
    return authResult.error;
  }
  
  const { orgId } = authResult.authContext;
  logger.info(`Getting reviews for org: ${orgId}`);
  
  params = getParams(params) || {};
  let repo;

  try {
    repo = new StateRepository();
    await repo.init();
    let ids = params.ids || (params.id ? [params.id] : []);
    if (!Array.isArray(ids) || ids.length === 0) {
      logger.error('Missing or invalid ids array.');
      return errorResponse(400, 'Missing or invalid ids array.', logger);
    }
    const results = [];
    for (const id of ids) {
      if (!id) continue;
      const result = await repo.get(id);
      if (!result) continue;
      results.push(result);
    }
    return {
      statusCode: 200,
      body: results
    };
  } finally {
    if (repo) await repo.close();
  }
}

exports.main = main;
