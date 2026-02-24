const { Core } = require('@adobe/aio-sdk');
const { getParams, errorResponse } = require('../utils');
const { StateRepository } = require('../storage-repository');
const { requireAuth } = require('../auth');

async function main(params) {
  const logger = Core.Logger('delete-reviews-by-ids', { level: params.LOG_LEVEL || 'warn' });
  
  // AUTHENTICATION CHECK
  const authResult = requireAuth(params, logger);
  if (!authResult.success) {
    return authResult.error;
  }

  const args = getParams(params);
  let ids = args.ids || (args.id ? [args.id] : []);
  if (!Array.isArray(ids) || ids.length === 0) {
    logger.error('Missing or invalid ids array.');
    return errorResponse(400, 'Missing or invalid ids array.', logger);
  }

  let repo;
  try {
    repo = new StateRepository();
    await repo.init();
    const results = [];

    for (const id of ids) {
      if (!id) {
        results.push({ id, success: false, error: 'Missing id.' });
        continue;
      }
      try {
        await repo.delete(id);
        results.push({ id, success: true });
      } catch (err) {
        logger.error(`Failed to delete review with id ${id}: ${err.message}`);
        results.push({ id, success: false, error: err.message });
      }
    }

    return {
      statusCode: 200,
      body: { results },
    };
  } finally {
    if (repo) await repo.close();
  }
}

exports.main = main;
