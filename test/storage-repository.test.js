/*
 * Unit tests for storage-repository.js - StateRepository class
*/

const { StateRepository } = require('../actions/storage-repository');

jest.mock('@adobe/aio-lib-db');

const mockDbLib = require('@adobe/aio-lib-db');

describe('StateRepository', () => {
  let repo;
  let mockCollection;
  let mockClient;

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn()
    };
    mockClient = {
      collection: jest.fn().mockResolvedValue(mockCollection),
      close: jest.fn()
    };
    mockDbLib.init.mockResolvedValue({ connect: jest.fn().mockResolvedValue(mockClient) });
    repo = new StateRepository({ keepAlive: false });
  });

  afterEach(async () => {
    if (repo) {
      await repo.close();
    }
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('initializes with default options', () => {
      const newRepo = new StateRepository();
      expect(newRepo.options).toEqual({ keepAlive: true });
      expect(newRepo._collection).toBeNull();
    });

    test('initializes with custom options', () => {
      const options = { region: 'emea', collection: 'custom' };
      const newRepo = new StateRepository(options);
      expect(newRepo.options).toEqual({ ...options, keepAlive: true });
    });
  });

  describe('init', () => {
    test('initializes db library once', async () => {
      await repo.init();

      expect(mockDbLib.init).toHaveBeenCalledTimes(1);
      expect(repo._collection).toBe(mockCollection);
    });

    test('does not reinitialize if already initialized', async () => {
      await repo.init();
      await repo.init();

      expect(mockDbLib.init).toHaveBeenCalledTimes(1);
    });

    test('initializes with provided options', async () => {
      const optionsRepo = new StateRepository({ region: 'emea', collection: 'custom', keepAlive: false });
      await optionsRepo.init();

      expect(mockDbLib.init).toHaveBeenCalledWith({ region: 'emea' });
      expect(mockClient.collection).toHaveBeenCalledWith('custom');
    });

    test('returns the repository instance for chaining', async () => {
      const result = await repo.init();

      expect(result).toBe(repo);
    });
  });

  describe('get', () => {
    test('calls findOne with key', async () => {
      mockCollection.findOne.mockResolvedValue({ _id: 'test-key', value: 'test-value' });
      await repo.init();

      const result = await repo.get('test-key');

      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'test-key' });
      expect(result).toEqual({ value: 'test-value' });
    });

    test('initializes db if not initialized', async () => {
      mockCollection.findOne.mockResolvedValue({ _id: 'test-key', value: 'test-value' });

      const result = await repo.get('test-key');

      expect(mockDbLib.init).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ value: 'test-value' });
    });
  });

  describe('put', () => {
    test('upserts document with key and value', async () => {
      mockCollection.updateOne.mockResolvedValue({ acknowledged: true });
      await repo.init();

      const result = await repo.put('test-key', { id: 'test-key', value: 'test-value' });

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'test-key' },
        { $set: { id: 'test-key', value: 'test-value' } },
        { upsert: true }
      );
      expect(result).toEqual({ id: 'test-key' });
    });

    test('parses JSON string values', async () => {
      mockCollection.updateOne.mockResolvedValue({ acknowledged: true });

      await repo.put('test-key', JSON.stringify({ id: 'test-key', value: 'test-value' }));

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'test-key' },
        { $set: { id: 'test-key', value: 'test-value' } },
        { upsert: true }
      );
    });
  });

  describe('delete', () => {
    test('calls deleteOne with key', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
      await repo.init();

      const result = await repo.delete('test-key');

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 'test-key' });
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe('find', () => {
    test('calls find with query and options', async () => {
      const mockCursor = jest.fn();
      mockCollection.find.mockReturnValue(mockCursor);
      await repo.init();

      const result = await repo.find({ sku: 'SKU123' }, { limit: 5 });

      expect(mockCollection.find).toHaveBeenCalledWith({ sku: 'SKU123' }, { limit: 5 });
      expect(result).toBe(mockCursor);
    });
  });

  describe('normalize', () => {
    test('strips _id from document', () => {
      const result = repo.normalize({ _id: 'test-key', id: 'test-key', sku: 'SKU' });
      expect(result).toEqual({ id: 'test-key', sku: 'SKU' });
    });
  });

  describe('close', () => {
    test('closes db client and resets connection', async () => {
      repo = new StateRepository({ keepAlive: false });
      await repo.init();

      await repo.close();

      expect(mockClient.close).toHaveBeenCalledTimes(1);
      expect(repo._collection).toBeNull();
    });
  });
});
