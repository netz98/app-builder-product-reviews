---
name: app-builder-db
description: Comprehensive App Builder Database Storage skill for provisioning, managing, and querying document databases via the AIO CLI and `@adobe/aio-lib-db`.
---

# App Builder Database Storage Skill

## Overview

This skill enables an agent to work with Adobe App Builder Database Storage (ABDB), a document-style persistence layer for App Builder Runtime Actions. It supports database provisioning, collection and index management, CRUD operations, cursor-based access patterns, and supported aggregation pipelines. The runtime interface is modeled closely on the MongoDB Node.js driver and is constrained by Amazon DocumentDB 8.0 compatibility.

## Quick Start

```bash
# Provision a workspace database
aio app db provision

# Check status and connectivity
aio app db status
aio app db ping
```

```js
const libDb = require('@adobe/aio-lib-db')

const db = await libDb.init({ region: 'amer' })
const client = await db.connect()
const users = await client.collection('users')

await users.insertOne({ name: 'Jane', age: 30 })
await client.close()
```

## CLI Operations

### Database Lifecycle

```bash
aio app db provision
aio app db status
aio app db ping
aio app db delete
```

### Collections

```bash
aio app db collection create inventory
aio app db collection list
aio app db collection rename inventory stock
aio app db collection drop stock
```

### Indexes

```bash
aio app db index create inventory -k sku -k rating
aio app db index list inventory
aio app db index drop inventory INDEXNAME
```

### Documents

```bash
aio app db document insert inventory '{"sku":"123","quantity":5}'
aio app db document find inventory '{}'
aio app db document update inventory '{"sku":"123"}' '{"$set":{"quantity":10}}'
```

## Runtime Usage

### Connecting

```js
const libDb = require('@adobe/aio-lib-db')
const { DbError } = libDb

const db = await libDb.init({ region: 'amer' })
const client = await db.connect()
```

### CRUD Operations

```js
await users.insertMany([
  { name: 'Alice', age: 27 },
  { name: 'Bob', age: 12 }
])

const cursor = users.find({ age: { $gte: 18 } })
for await (const doc of cursor) {
  console.log(doc)
}
```

### Aggregation

```js
const pipeline = [
  { $match: { status: 'active' } },
  { $group: { _id: '$category', count: { $sum: 1 } } }
]

const results = await users.aggregate(pipeline).toArray()
```

## Constraints

- One database per App Builder workspace
- Single-region provisioning (`amer`, `emea`, `apac`)
- No direct administrative database commands
- Limited aggregation stages and cursor methods

## Common Tasks

### Handling `_id` Values

```js
const { ObjectId } = require('bson')
const doc = await users.findOne({ _id: new ObjectId(idString) })
```

### Error Handling

```js
try {
  await users.insertOne({})
} catch (e) {
  if (e instanceof DbError) {
    console.error(e.message)
  }
}
```

## Compatibility Notes

- API modeled after MongoDB Node.js Driver
- Backed by Amazon DocumentDB with MongoDB 8.0 compatibility
- Unsupported MongoDB features will fail at runtime

## Next Steps

- Review MongoDB Node.js Driver documentation for supported APIs
- Use indexes to optimize frequently queried fields
- Validate region configuration before runtime initialization
