const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getParams } = require('../utils');
const { StateRepository } = require('../storage-repository');
const { updateReview, parseReview } = require('../review');
const { requireAuth } = require('../auth');

async function main(params) {
    const logger = Core.Logger('update-reviews', { level: params.LOG_LEVEL || 'warn' });
  
    // AUTHENTICATION CHECK
    const authResult = requireAuth(params, logger);
    if (!authResult.success) {
        return authResult.error;
    }

    const args = getParams(params);
    const { reviews } = args;
    
    if (!Array.isArray(reviews) || reviews.length === 0) {
        return errorResponse(400, 'Missing or invalid reviews array.');
    }

  let repo;
  try {
    repo = new StateRepository();
    await repo.init();
    const results = [];

    for (const update of reviews) {
      const { id } = update;
      if (!id) {
        results.push({ id, success: false, error: 'Missing id.' });
        continue;
      }
      try {
        const res = await repo.get(id);
        if (!res) {
          results.push({ id, success: false, error: 'Review not found.' });
          continue;
        }
        const existing = parseReview(res);
        if (!existing) {
          results.push({ id, success: false, error: 'Failed to parse or validate existing review.' });
          continue;
        }
        let updated;
        try {
          updated = updateReview(existing, update);
        } catch (err) {
          results.push({ id, success: false, error: err.message });
          continue;
        }

        await repo.put(id, updated);
        results.push({ id, success: true, review: updated });
      } catch (err) {
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
