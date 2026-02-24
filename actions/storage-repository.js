const dbLib = require('@adobe/aio-lib-db');

const sharedConnections = new Map();

class StateRepository {
  constructor(options = {}) {
    this.options = { keepAlive: true, ...options };
    this._db = null;
    this._client = null;
    this._collection = null;
  }

  async init() {
    if (!this._collection) {
      const region = this.options.region || process.env.AIO_DB_REGION || 'emea';
      const collectionName = this.options.collection || 'reviews';
      const connectionKey = `${region}::${collectionName}`;
      if (sharedConnections.has(connectionKey)) {
        const shared = sharedConnections.get(connectionKey);
        this._db = shared.db;
        this._client = shared.client;
        this._collection = shared.collection;
        return this;
      }

      this._db = await dbLib.init({ region });
      this._client = await this._db.connect();
      this._collection = await this._client.collection(collectionName);
      sharedConnections.set(connectionKey, {
        db: this._db,
        client: this._client,
        collection: this._collection
      });
    }
    return this;
  }

  async get(key) {
    await this.init();
    const doc = await this._collection.findOne({ _id: key });
    return this.normalize(doc);
  }

  async put(key, value) {
    await this.init();
    let doc = value;
    if (typeof value === 'string') {
      try {
        doc = JSON.parse(value);
      } catch (error) {
        doc = { value };
      }
    }
    if (!doc || typeof doc !== 'object') {
      doc = { value: doc };
    }
    const reviewDoc = { ...doc, id: doc.id || key };
    await this._collection.updateOne({ _id: key }, { $set: reviewDoc }, { upsert: true });
    return { id: key };
  }

  async delete(key) {
    await this.init();
    return this._collection.deleteOne({ _id: key });
  }

  async find(query = {}, options = {}) {
    await this.init();
    return this._collection.find(query, options);
  }

  async count(query = {}) {
    await this.init();
    return this._collection.countDocuments(query);
  }

  normalize(doc) {
    if (!doc) return null;
    const rest = { ...doc };
    delete rest._id;
    return rest;
  }

  async close() {
    if (this.options.keepAlive) {
      return;
    }
    const client = this._client;
    if (client && typeof client.close === 'function') {
      await client.close();
    }
    this._db = null;
    this._client = null;
    this._collection = null;
    for (const [key, shared] of sharedConnections.entries()) {
      if (shared.client === client) {
        sharedConnections.delete(key);
      }
    }
  }
}

module.exports = {
  StateRepository
};
