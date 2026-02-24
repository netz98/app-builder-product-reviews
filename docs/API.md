# API Reference

## Table of Contents
1. [Base URLs](#base-urls)
2. [Create Review](#1-create-review)
3. [Update Reviews](#2-update-reviews)
4. [Delete Reviews by IDs](#3-delete-reviews-by-ids)
5. [Get List Reviews](#4-get-list-reviews)
6. [Get Reviews by IDs](#5-get-reviews-by-ids)
7. [State Test](#6-state-test)
8. [Error Handling](#error-handling)

---

## Base URLs

**Production:**
```bash
https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app
```

**Local Development:**
```bash
http://localhost:9080/api/v1/web/review-app
```

Replace `{NAMESPACE}` with your Adobe I/O Runtime namespace.

---

## 1. Create Review

### Endpoint
`POST /create-review`

### Description
Creates a new product review. All fields are required.

### Request

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/create-review" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{
    "sku": "SKU-12345",
    "rating": 5,
    "title": "Great product!",
    "text": "Excellent quality and fast shipping",
    "author": "John Doe",
    "author_email": "john.doe@example.com",
    "status": "pending"
  }'
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sku` | string | Yes | Product SKU |
| `rating` | integer | Yes | Rating between 1-5 |
| `title` | string | Yes | Review title |
| `text` | string | Yes | Review content |
| `author` | string | Yes | Author name |
| `author_email` | string | Yes | Valid email address |
| `status` | string | No | Review status (defaults to "pending") |

### Response (201 Created)

```json
{
  "statusCode": 201,
  "body": {
    "id": "{UUID}",
    "sku": "SKU-12345",
    "rating": 5,
    "title": "Great product!",
    "text": "Excellent quality and fast shipping",
    "author": "John Doe",
    "author_email": "john.doe@example.com",
    "status": "pending",
    "created_at": "2025-01-19T10:00:00.000Z",
    "updated_at": "2025-01-19T10:00:00.000Z"
  }
}
```

### Validation Rules

- All fields required (except `status`)
- `rating`: Integer between 1-5
- `author_email`: Valid email format
- `status`: "pending", "approved", or "rejected" (defaults to "pending")

### Error Responses

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "body": {
    "error": "Missing required review fields"
  }
}
```

---

## 2. Update Reviews

### Endpoint
`POST /update-reviews`

### Description
Batch update multiple reviews. Only provided fields are updated. Allows partial success/failure.

### Request

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/update-reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{
    "reviews": [
      {
        "id": "{UUID}",
        "status": "approved"
      },
      {
        "id": "{UUID}",
        "rating": 4,
        "title": "Updated title"
      }
    ]
  }'
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reviews` | array | Yes | Array of review objects to update |

**Review Object:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Review ID |
| `sku` | string | No | New SKU |
| `rating` | integer | No | New rating (1-5) |
| `title` | string | No | New title |
| `text` | string | No | New text |
| `author` | string | No | New author |
| `author_email` | string | No | New email |
| `status` | string | No | New status |

### Response (200 OK)

```json
{
  "statusCode": 200,
  "body": {
    "results": [
      {
        "id": "{UUID}",
        "success": true,
        "review": {
          "id": "{UUID}",
          "sku": "SKU-12345",
          "rating": 5,
          "title": "Great product!",
          "status": "approved",
          "updated_at": "2025-01-19T11:00:00.000Z"
        }
      },
      {
        "id": "{UUID}",
        "success": true,
        "review": {
          "id": "{UUID}",
          "sku": "SKU-12345",
          "rating": 4,
          "title": "Updated title",
          "updated_at": "2025-01-19T11:00:00.000Z"
        }
      }
    ]
  }
}
```

### Partial Failure Example

```json
{
  "statusCode": 200,
  "body": {
    "results": [
      {
        "id": "valid-id",
        "success": true,
        "review": { /* updated review */ }
      },
      {
        "id": "invalid-id",
        "success": false,
        "error": "Review not found."
      }
    ]
  }
}
```

---

## 3. Delete Reviews by IDs

### Endpoint
`POST /delete-reviews-by-ids`

### Description
Batch delete multiple reviews by their IDs. Allows partial success/failure.

### Request

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/delete-reviews-by-ids" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{
    "ids": [
      "{UUID}",
      "{UUID}"
    ]
  }'
```

### Request (Single ID)

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/get-reviews-by-ids" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{
    "id": "{UUID}"
  }'
```

### Request (Single ID)

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/delete-reviews-by-ids" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{
    "id": "{UUID}"
  }'
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | array | No | Array of review IDs to delete |
| `id` | string | No | Single review ID to delete |

Provide either `ids` or `id`.

### Response (200 OK)

```json
{
  "statusCode": 200,
  "body": {
    "results": [
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
```

---

## 4. Get List Reviews

### Endpoint
`POST /get-list-reviews`

### Description
Lists all reviews with optional filtering. Filters use case-insensitive substring matching.

### Request (All Reviews)

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/get-list-reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{}'
```

### Request (Filtered by Status)

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/get-list-reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{
    "status": "approved"
  }'
```

### Request (Multiple Filters)

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/get-list-reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{
    "sku": "SKU-12345",
    "status": "approved",
    "rating": 5,
    "author": "John"
  }'
```

### Request (Pagination + Sort)

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/get-list-reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{
    "page": 2,
    "pageSize": 25,
    "sortBy": "created_at",
    "sortDir": "desc"
  }'
```

### Request Body (Optional Filters)

| Field | Type | Description |
|-------|------|-------------|
| `sku` | string | Product SKU (case-insensitive substring match) |
| `status` | string | Review status ("pending", "approved", "rejected") |
| `rating` | integer | Exact rating value (1-5) |
| `author` | string | Author name (case-insensitive substring match) |
| `author_email` | string | Author email (case-insensitive substring match) |
| `text` | string | Review text content (case-insensitive substring match) |
| `page` | integer | Page number (1-based, default: 1) |
| `pageSize` | integer | Items per page (default: 10) |
| `sortBy` | string | Sort field: `created_at`, `updated_at`, `rating`, `status` |
| `sortDir` | string | Sort direction: `asc`, `desc` (default: `desc`) |

### Response (200 OK)

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "items": [
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
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "sortBy": "created_at",
    "sortDir": "desc"
  }
}
```

### Filter Behavior

- All filters use **AND** logic
- String filters are **case-insensitive**
- String filters use **substring matching**
- Rating filter requires **exact match**
- Pagination uses `page` and `pageSize` (defaults: 1 and 10)
- Sorting applies to the page result using `sortBy` and `sortDir`

---

## 5. Get Reviews by IDs

### Endpoint
`POST /get-reviews-by-ids`

### Description
Fetches specific reviews by their IDs. Silently skips missing IDs.

### Request

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/get-reviews-by-ids" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{
    "ids": [
      "{UUID}",
      "{UUID}"
    ]
  }'
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | array | No | Array of review IDs |
| `id` | string | No | Single review ID |

Provide either `ids` or `id`.

### Response (200 OK)

```json
{
  "statusCode": 200,
  "body": [
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
```

### Behavior

- If any IDs don't exist, they are silently omitted from response
- No error for missing reviews
- Useful when you need specific reviews and want graceful handling

---

## 6. State Test

### Endpoint
`POST /state-test`

### Description
Diagnostic endpoint for testing storage connectivity. Not for production use.

### Request

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/state-test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {IMS_TOKEN}" \
  -H "x-gw-ims-org-id: {ORG_ID}" \
  -d '{}'
```

### Response (200 OK)

```json
{
  "statusCode": 200,
  "body": {
    "status": "All tests passed!",
    "results": {
      "init": "SUCCESS: State library initialized.",
      "put": "SUCCESS: Wrote data to storage.",
      "get": "SUCCESS: Read correct data back from storage.",
      "delete": "SUCCESS: Deleted the test data."
    }
  }
}
```

### Use Cases

- Testing storage connectivity
- Debugging storage issues
- Verifying deployment

---

## Error Handling

### Response Structure

**Success:**
```json
{
  "statusCode": 200 | 201,
  "body": { /* result object */ }
}
```

**Error:**
```json
{
  "statusCode": 400 | 401 | 403 | 404 | 500,
  "body": {
    "error": "Error message description"
  }
}
```

### Status Codes

| Code | Description |
|------|-------------|
| `200` | Success (GET, PUT, DELETE) |
| `201` | Created (POST) |
| `400` | Bad request (missing fields, invalid data) |
| `401` | Unauthorized (missing or invalid authentication) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not found |
| `500` | Server error |

### Common Error Responses

**Missing Required Fields:**
```json
{
  "statusCode": 400,
  "body": {
    "error": "Missing required review fields"
  }
}
```

**Invalid Email:**
```json
{
  "statusCode": 400,
  "body": {
    "error": "Invalid email format for author_email"
  }
}
```

**Invalid Rating:**
```json
{
  "statusCode": 400,
  "body": {
    "error": "Rating must be a number between 1 and 5"
  }
}
```

**Unauthorized:**
```json
{
  "statusCode": 401,
  "body": {
    "error": "Unauthorized"
  }
}
```

**Review Not Found:**
```json
{
  "statusCode": 200,
  "body": {
    "results": [
      {
        "id": "invalid-id",
        "success": false,
        "error": "Review not found."
      }
    ]
  }
}
```

### Batch Operations

Batch operations always return `200` status with per-item results:

```json
{
  "statusCode": 200,
  "body": {
    "results": [
      { "id": "id1", "success": true, "review": {...} },
      { "id": "id2", "success": false, "error": "Review not found." }
    ]
  }
}
```

**Pattern:**
- Check `success` field for each item
- If `success` is `false`, check `error` field
- Partial success is allowed

---

## Summary

Complete API endpoints:
- ✅ Create review
- ✅ Update reviews (batch)
- ✅ Delete reviews (batch)
- ✅ List all reviews with filters
- ✅ Get reviews by IDs
- ✅ State test (diagnostics)

**Next Steps:**
- For GraphQL integration, see [GRAPHQL.md](GRAPHQL.md)
- For authentication details, see [AUTHENTICATION.md](AUTHENTICATION.md)
