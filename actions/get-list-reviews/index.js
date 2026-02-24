const { Core } = require('@adobe/aio-sdk');
const { StateRepository } = require('../storage-repository');
const { getParams, errorResponse } = require('../utils');
const { SEARCHABLE_FIELDS } = require('../review');
const { requireAuth } = require('../auth');

async function main(params) {
  const logger = Core.Logger('get-list-reviews', { level: params.LOG_LEVEL || 'warn' });
  // Log all headers received by the action for debugging
  logger.debug('Received __ow_headers:', params.__ow_headers);

  // AUTHENTICATION CHECK
  const authResult = requireAuth(params, logger);
  if (!authResult.success) {
    return authResult.error;
  }
  
  params = getParams(params) || {};
  let repo

  try {
    const reviews = [];
    repo = new StateRepository();
    await repo.init();

    const query = {};
    const filterKeys = Object.keys(params).filter(k => SEARCHABLE_FIELDS.includes(k));
    const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const key of filterKeys) {
      const value = params[key];
      if (value === undefined || value === null || value === '') continue;
      if (key === 'rating') {
        const numericRating = parseInt(value, 10);
        if (!Number.isNaN(numericRating)) {
          query[key] = numericRating;
        }
      } else if (key === 'status') {
        query[key] = { $regex: `^${escapeRegex(value)}$`, $options: 'i' };
      } else {
        query[key] = { $regex: String(value), $options: 'i' };
      }
    }

    const page = Number.isFinite(Number(params.page)) ? Math.max(1, Number(params.page)) : 1;
    const pageSize = Number.isFinite(Number(params.pageSize)) ? Math.max(1, Number(params.pageSize)) : 10;
    const sortBy = ['created_at', 'updated_at', 'rating', 'status'].includes(params.sortBy) ? params.sortBy : 'created_at';
    const sortDir = params.sortDir === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortDir };
    const skip = (page - 1) * pageSize;

    logger.debug(`Searching reviews with query: ${JSON.stringify(query)}`);
    const cursor = await repo.find(query);
    if (cursor && typeof cursor.sort === 'function') {
      cursor.sort(sort);
    }
    if (cursor && typeof cursor.skip === 'function' && skip > 0) {
      cursor.skip(skip);
    }
    if (cursor && typeof cursor.limit === 'function') {
      cursor.limit(pageSize);
    }

    for await (const doc of cursor) {
      const reviewObject = repo.normalize(doc);
      if (reviewObject) {
        reviews.push(reviewObject);
      }
    }

    const total = await repo.count(query);
    logger.info(`Total reviews fetched: ${reviews.length}`);
    
    logger.info(`Filter keys: ${filterKeys}`);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        items: reviews,
        total,
        page,
        pageSize,
        sortBy,
        sortDir: sortDir === 1 ? 'asc' : 'desc'
      },
    };
  } catch (error) {
    logger.error('Failed to list reviews', error);
    return errorResponse(500, 'Server error while listing reviews.', logger);
  } finally {
      // Ensure the connection is closed after the request is done
      if (repo) await repo.close();
  }
}

exports.main = main;
