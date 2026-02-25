# GraphQL Mesh Guide

## Table of Contents
1. [Overview](#overview)
2. [GraphQL Schema](#graphql-schema)
3. [Operations](#operations)
4. [Configuration](#configuration)
5. [GraphQL vs REST](#graphql-vs-rest)

---

## Overview

The application includes a GraphQL Mesh configuration (`mesh.json`) that provides a unified GraphQL API layer. This is used by the Commerce Backend UI extension to query reviews via GraphQL.

### Key Benefits

- ✅ Unified query interface
- ✅ Type-safe schema
- ✅ Automatic authentication headers
- ✅ Request/response validation
- ✅ Seamless Commerce Backend UI integration

### Authentication Headers

The Mesh automatically forwards authentication headers to REST endpoints:

```json
{
  "operationHeaders": {
    "Authorization": "{context.headers['authorization']}",
    "x-gw-ims-org-id": "{context.headers['x-gw-ims-org-id']}",
    "Content-Type": "application/json"
  }
}
```

---

## GraphQL Schema

The Mesh exposes the following operations:

### Mutations

- `create_review` - Create a new review
- `update_reviews` - Update multiple reviews
- `delete_reviews_by_ids` - Delete reviews by IDs

### Queries

- `get_list_reviews` - Get reviews with filters
- `get_reviews_by_ids` - Get reviews by IDs
- `state_test` - Diagnostic endpoint

---

## Operations

### 1. Create Review (Mutation)

**Field:** `create_review`

**Query:**
```graphql
mutation CreateReview($input: CreateReviewInput!) {
  ReviewsService {
    create_review(input: $input) {
      id
      sku
      rating
      title
      text
      author
      author_email
      status
      created_at
      updated_at
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "sku": "SKU-12345",
    "rating": 5,
    "title": "Great product!",
    "text": "Excellent quality",
    "author": "John Doe",
    "author_email": "john.doe@example.com",
    "status": "pending"
  }
}
```

**Response:**
```json
{
  "data": {
    "ReviewsService": {
      "create_review": {
        "id": "{UUID}",
        "sku": "SKU-12345",
        "rating": 5,
        "title": "Great product!",
        "text": "Excellent quality",
        "author": "John Doe",
        "author_email": "john.doe@example.com",
        "status": "pending",
        "created_at": "2025-01-19T10:00:00.000Z",
        "updated_at": "2025-01-19T10:00:00.000Z"
      }
    }
  }
}
```

---

### 2. Get List Reviews (Query)

**Field:** `get_list_reviews`

**Query:**
```graphql
query GetListReviews($sku: String, $status: String, $rating: Int, $author: String, $author_email: String, $text: String, $page: Int, $pageSize: Int, $sortBy: String, $sortDir: String) {
  ReviewsService {
    get_list_reviews(
      sku: $sku
      status: $status
      rating: $rating
      author: $author
      author_email: $author_email
      text: $text
      page: $page
      pageSize: $pageSize
      sortBy: $sortBy
      sortDir: $sortDir
    ) {
      items {
        id
        sku
        rating
        title
        text
        author
        author_email
        status
        created_at
        updated_at
      }
      total
      page
      pageSize
      sortBy
      sortDir
    }
  }
}
```

**Variables (filtered by status):**
```json
{
  "status": "approved",
  "sku": "SKU-12345"
}
```

**Response:**
```json
{
  "data": {
    "ReviewsService": {
      "get_list_reviews": {
        "items": [
          {
            "id": "{UUID}",
            "sku": "SKU-12345",
            "rating": 5,
            "title": "Great product!",
            "status": "approved",
            "created_at": "2025-01-19T10:00:00.000Z",
            "updated_at": "2025-01-19T10:00:00.000Z"
          }
        ],
        "total": 1,
        "page": 1,
        "pageSize": 10,
        "sortBy": "created_at",
        "sortDir": "desc"
      }
    }
  }
}
```

---

### 3. Get Reviews by IDs (Query)

**Field:** `get_reviews_by_ids`

**Query:**
```graphql
query GetReviewsByIds($ids: [String!]!) {
  ReviewsService {
    get_reviews_by_ids(ids: $ids) {
      id
      sku
      rating
      title
      text
      author
      author_email
      status
      created_at
      updated_at
    }
  }
}
```

**Variables:**
```json
{
  "ids": [
    "{UUID}",
    "{UUID}"
  ]
}
```

**Response:**
```json
{
  "data": {
    "ReviewsService": {
      "get_reviews_by_ids": [
        {
          "id": "{UUID}",
          "sku": "SKU-12345",
          "rating": 5,
          "title": "Great product!",
          "text": "Excellent quality",
          "author": "John Doe",
          "author_email": "john.doe@example.com",
          "status": "approved",
          "created_at": "2025-01-19T10:00:00.000Z",
          "updated_at": "2025-01-19T10:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### 4. Update Reviews (Mutation)

**Field:** `update_reviews`

**Query:**
```graphql
mutation UpdateReviews($reviews: [UpdateReviewInput!]!) {
  ReviewsService {
    update_reviews(reviews: $reviews) {
      id
      success
      error
      review {
        id
        sku
        rating
        title
        status
        updated_at
      }
    }
  }
}
```

**Variables:**
```json
{
  "reviews": [
    {
      "id": "{UUID}",
      "status": "approved"
    },
    {
      "id": "{UUID}",
      "rating": 4
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "ReviewsService": {
      "update_reviews": [
        {
          "id": "{UUID}",
          "success": true,
          "review": {
            "id": "{UUID}",
            "sku": "SKU-12345",
            "rating": 5,
            "status": "approved",
            "updated_at": "2025-01-19T11:00:00.000Z"
          }
        },
        {
          "id": "{UUID}",
          "success": true,
          "review": {
            "id": "{UUID}",
            "rating": 4,
            "updated_at": "2025-01-19T11:00:00.000Z"
          }
        }
      ]
    }
  }
}
```

---

### 5. Delete Reviews by IDs (Mutation)

**Field:** `delete_reviews_by_ids`

**Query:**
```graphql
mutation DeleteReviewsByIds($ids: [String!]!) {
  ReviewsService {
    delete_reviews_by_ids(ids: $ids) {
      id
      success
      error
    }
  }
}
```

**Variables:**
```json
{
  "ids": [
    "{UUID}",
    "{UUID}"
  ]
}
```

**Response:**
```json
{
  "data": {
    "ReviewsService": {
      "delete_reviews_by_ids": [
        {
          "id": "{UUID}",
          "success": true
        },
        {
          "id": "{UUID}",
          "success": false,
          "error": "Review not found."
        }
      ]
    }
  }
}
```

---

### 6. State Test (Query)

**Field:** `state_test`

**Query:**
```graphql
query StateTest {
  ReviewsService {
    state_test {
      status
      results {
        init
        put
        get
        delete
      }
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "ReviewsService": {
      "state_test": {
        "status": "All tests passed!",
        "results": {
          "init": "SUCCESS: State library initialized.",
          "put": "SUCCESS: Wrote data to storage.",
          "get": "SUCCESS: Read correct data back from storage.",
          "delete": "SUCCESS: Deleted the test data."
        }
      }
    }
  }
}
```

---

## Configuration

### Mesh Config Structure

The GraphQL Mesh is configured in `mesh.json`:

```json
{
  "meshConfig": {
    "sources": [
      {
        "name": "ReviewsService",
        "handler": {
          "JsonSchema": {
            "baseUrl": "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app",
            "operationHeaders": {
              "Authorization": "{context.headers['authorization']}",
              "x-gw-ims-org-id": "{context.headers['x-gw-ims-org-id']}",
              "Content-Type": "application/json"
            },
            "operations": [
              {
                "type": "Mutation",
                "field": "create_review",
                "path": "/create-review",
                "method": "POST",
                "requestSchema": "./req_create-review.json",
                "responseSchema": "./res_create-review.json"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### Configuration Components

**baseUrl**: Base URL for the REST API
**operationHeaders**: Headers to forward to REST endpoints
**operations**: List of REST endpoints exposed as GraphQL operations

**Operation Fields:**
- `type`: "Query" or "Mutation"
- `field`: GraphQL field name
- `path`: REST endpoint path
- `method`: HTTP method
- `requestSchema`: Request validation schema
- `responseSchema`: Response validation schema

### Schema Files

Each operation has associated schema files for validation:

**Request Schema Example (`req_create-review.json`):**
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "sku": { "type": "string" },
    "rating": { "type": "integer", "minimum": 1, "maximum": 5 },
    "title": { "type": "string" },
    "text": { "type": "string" },
    "author": { "type": "string" },
    "author_email": { "type": "string", "format": "email" },
    "status": { "type": "string" }
  },
  "required": ["sku", "rating", "title", "text", "author", "author_email"]
}
```

**Response Schema Example (`res_create-review.json`):**
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "sku": { "type": "string" },
    "rating": { "type": "integer" },
    "title": { "type": "string" },
    "text": { "type": "string" },
    "author": { "type": "string" },
    "author_email": { "type": "string", "format": "email" },
    "status": { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "sku", "rating", "title", "text", "author", "author_email", "status", "created_at", "updated_at"]
}
```

---

## GraphQL vs REST

### When to Use GraphQL

- From Commerce Backend UI extension
- When you need a unified query interface
- When you're building a frontend that uses GraphQL
- When you need type-safe queries
- When you want automatic documentation

### When to Use REST

- Direct API testing with cURL
- PHP or other backend integrations
- When you need simple HTTP calls
- When GraphQL Mesh is not available
- When you want minimal overhead

### Comparison

| Feature | GraphQL | REST |
|---------|---------|------|
| Type Safety | ✅ Yes | ❌ No |
| Documentation | ✅ Auto-generated | ❌ Manual |
| Query Flexibility | ✅ High | ❌ Limited |
| Learning Curve | ⚠️ Medium | ✅ Low |
| Integration | ⚠️ Requires Mesh | ✅ Simple |
| Performance | ⚠️ Overhead | ✅ Direct |

---

## Using GraphQL in Commerce Backend UI

### Component Example

```javascript
import React from 'react';
import { useQuery } from '@apollo/client';

const GET_LIST_REVIEWS = gql`
  query GetListReviews($sku: String) {
    ReviewsService {
      get_list_reviews(sku: $sku) {
        items {
          id
          sku
          rating
          title
          author
          status
        }
      }
    }
  }
`;

export function ReviewsList({ sku }) {
  const { loading, error, data } = useQuery(GET_LIST_REVIEWS, {
    variables: { sku }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.ReviewsService.get_list_reviews.items.map(review => (
        <li key={review.id}>
          {review.title} - {review.rating}/5
        </li>
      ))}
    </ul>
  );
}
```

### Mutation Example

```javascript
import { useMutation } from '@apollo/client';

const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    ReviewsService {
      create_review(input: $input) {
        id
        sku
        rating
        title
      }
    }
  }
`;

export function CreateReviewForm() {
  const [createReview, { loading, error }] = useMutation(CREATE_REVIEW);

  const handleSubmit = async (data) => {
    await createReview({ variables: { input: data } });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Troubleshooting GraphQL

### Common Issues

#### "Field doesn't exist"

**Problem:** GraphQL field not found in schema

**Solution:**
1. Check field name matches operation definition
2. Verify operation is in mesh.json
3. Check spelling and case sensitivity

#### "Missing required field"

**Problem:** Required field missing from query

**Solution:**
1. Check schema for required fields
2. Add missing field to query
3. Verify variable types match schema

#### "Network error"

**Problem:** Cannot reach REST endpoint

**Solution:**
1. Check baseUrl in mesh.json
2. Verify authentication headers
3. Check network connectivity
4. Verify REST endpoint is deployed

### Debug Mode

Enable verbose logging:

```bash
LOG_LEVEL=debug aio app dev
```

Check logs for GraphQL Mesh errors.

---

## Summary

GraphQL Mesh provides:
- ✅ Unified GraphQL API over REST
- ✅ Type-safe queries
- ✅ Automatic authentication
- ✅ Request/response validation
- ✅ Commerce Backend UI integration

**Next Steps:**
- For REST API details, see [API.md](API.md)
- For authentication details, see [AUTHENTICATION.md](AUTHENTICATION.md)
- For UI integration, see [UI.md](UI.md)

---

## UI logging
UI log level is controlled via `window.APP_CONFIG.LOG_LEVEL` in `web-src/index.html` (e.g. `debug`, `info`, `warn`, `error`).
