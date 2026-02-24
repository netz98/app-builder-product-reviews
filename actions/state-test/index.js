const { Core } = require('@adobe/aio-sdk');
const { StateRepository } = require('../storage-repository');
const { requireAuth } = require('../auth');
const { errorResponse } = require('../utils');

async function main(params) {
    // We use console.log because Core.Logger buffers and may not flush on timeout
    console.log('--- STARTING STATE-TEST DIAGNOSTIC ---');
    console.log('Region:', params.AIO_DB_REGION || process.env.AIO_DB_REGION || 'not set');

    const logger = Core.Logger('state-test', { level: params.LOG_LEVEL || 'info' });

    const authResult = requireAuth(params, logger);
    if (!authResult.success) {
        console.log('Auth Failed');
        return authResult.error;
    }

    const testKey = `test_${Date.now()}`;
    const testValue = { message: 'Storage diagnostic', timestamp: new Date().toISOString() };
    let results = {};

    const repo = new StateRepository({
        region: params.AIO_DB_REGION // Explicitly pass from action inputs
    });

    try {
        // 1. Initialization
        console.log('1. Calling repo.init()...');
        // Set a manual race condition to detect if init hangs
        await Promise.race([
            repo.init(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('repo.init() timed out after 10s')), 10000))
        ]);
        console.log('1. SUCCESS: repo.init() resolved');
        results.init = 'SUCCESS';

        // 2. Write
        console.log(`2. Calling repo.put() for key: ${testKey}...`);
        await repo.put(testKey, testValue);
        console.log('2. SUCCESS: repo.put() resolved');
        results.put = 'SUCCESS';

        // 3. Read
        console.log('3. Calling repo.get()...');
        const retrieved = await repo.get(testKey);
        console.log('3. SUCCESS: repo.get() resolved');
        results.get = 'SUCCESS';
        results.retrieved = retrieved;

        // 4. Cleanup
        console.log('4. Calling repo.delete()...');
        await repo.delete(testKey);
        console.log('4. SUCCESS: repo.delete() resolved');

        return {
            statusCode: 200,
            body: { status: 'Database is operational', results }
        };

    } catch (error) {
        console.error('!!! DIAGNOSTIC FAILED !!!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);

        const response = errorResponse(500, error.message, logger);
        response.body.stage = Object.keys(results).length;
        response.body.results = results;
        return response;
    } finally {
        if (repo) {
            console.log('Attempting repo.close()...');
            await repo.close().catch(e => console.error('Close error:', e.message));
        }
    }
}

exports.main = main;
