const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getParams } = require('../utils');
const { StateRepository } = require('../storage-repository');
const { createReview } = require('../review');
const { requireAuth } = require('../auth');

async function main(params) {
  const logger = Core.Logger('create-review', { level: params.LOG_LEVEL || 'warn' });
  
  // AUTHENTICATION CHECK
  const authResult = requireAuth(params, logger);
  if (!authResult.success) {
    return authResult.error;
  }

  let repo;
  try {
    let jsonBody = getParams(params);
    let newReview;
    try {
      newReview = createReview(jsonBody);
    } catch (err) {
      return errorResponse(400, err.message);
    }

    // 2. Initialize repository
    repo = new StateRepository();
    await repo.init();
    logger.debug(`State review before put: ${JSON.stringify(newReview)}`);

    await repo.put(newReview.id, newReview);
    logger.debug(`Successfully created review with id ${newReview.id}`);
    logger.debug(`Review object: ${JSON.stringify(newReview)}`);

    return {
      statusCode: 201,
      body: {
        ...newReview
      },
    };
  } catch (error) {
    logger.error(`Failed to create review: ${error.message}`);
    return errorResponse(500, 'Internal server error', logger);
  } finally {
    if (repo) await repo.close();
  }
}

exports.main = main;
