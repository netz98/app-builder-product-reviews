# Data Model Reference

## Table of Contents
1. [Review Object](#review-object)
2. [ID Format](#id-format)
3. [Status Values](#status-values)
4. [Storage](#storage)
5. [Validation Rules](#validation-rules)

---

## Review Object

### Interface Definition

```typescript
interface Review {
  id: string;                    // Format: {UUID}
  sku: string;                   // Product SKU
  rating: number;                // Integer 1-5
  title: string;                 // Review title
  text: string;                  // Review content
  author: string;                // Reviewer name
  author_email: string;           // Reviewer email (valid format)
  status: "pending" | "approved" | "rejected";  // Review status
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}
```

### Field Details

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | Auto-generated | Unique review identifier | `"550e8400-e29b-41d4-a716-446655440000"` |
| `sku` | string | Yes | Product SKU | `"SKU-12345"` |
| `rating` | integer | Yes | Rating between 1-5 | `5` |
| `title` | string | Yes | Review title | `"Great product!"` |
| `text` | string | Yes | Review content | `"Excellent quality and fast shipping"` |
| `author` | string | Yes | Reviewer name | `"John Doe"` |
| `author_email` | string | Yes | Valid email address | `"john.doe@example.com"` |
| `status` | string | No | Review status (defaults to "pending") | `"approved"` |
| `created_at` | string | Auto-generated | ISO 8601 creation timestamp | `"2025-01-19T10:00:00.000Z"` |
| `updated_at` | string | Auto-generated | ISO 8601 update timestamp | `"2025-01-19T10:00:00.000Z"` |

### Example Review

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sku": "SKU-12345",
  "rating": 5,
  "title": "Great product!",
  "text": "Excellent quality and fast shipping",
  "author": "John Doe",
  "author_email": "john.doe@example.com",
  "status": "approved",
  "created_at": "2025-01-19T10:00:00.000Z",
  "updated_at": "2025-01-19T10:00:00.000Z"
}
```

---

## ID Format

### Structure

Review IDs are generated as: `{UUID}`

### Components

**1. UUID**: UUID v4
- Universally unique identifier
- Ensures uniqueness across products
- 36 character string

### Example

```
UUID: "550e8400-e29b-41d4-a716-446655440000"
Review ID: "550e8400-e29b-41d4-a716-446655440000"
```

### Code Example

```javascript
// Generate review ID
import { v4 as uuidv4 } from 'uuid';

function generateReviewId() {
  return uuidv4();
}

// Usage
const reviewId = generateReviewId();
// Result: "550e8400-e29b-41d4-a716-446655440000"
```

### Purpose

- **UUID**: Ensures uniqueness across products
- **Simple**: No SKU encoding or parsing required

---

## Status Values

### Status Enum

```typescript
type ReviewStatus = "pending" | "approved" | "rejected";
```

### Status Definitions

#### Pending
- **Meaning**: Review is awaiting moderation
- **Default**: Yes (automatically set on creation)
- **Visibility**: Hidden from public
- **Actions**: Can be approved or rejected

#### Approved
- **Meaning**: Review has been approved
- **Default**: No
- **Visibility**: Visible to public
- **Actions**: Can be rejected

#### Rejected
- **Meaning**: Review has been rejected
- **Default**: No
- **Visibility**: Hidden from public
- **Actions**: Can be approved

### Status Transitions

```
          ┌─────────┐
          │ Pending │ ◀────┐
          └────┬────┘      │
               │          │
               ▼          │
          ┌─────────┐      │
          │Approved │      │
          └────┬────┘      │
               │          │
               ▼          │
          ┌─────────┐      │
          │Rejected │ ─────┘
          └─────────┘
```

### Usage Example

```javascript
// Filter by status
const approvedReviews = reviews.filter(r => r.status === 'approved');

// Update status
await updateReviews([{
  id: reviewId,
  status: 'approved'
}]);

// Count by status
const pendingCount = reviews.filter(r => r.status === 'pending').length;
const approvedCount = reviews.filter(r => r.status === 'approved').length;
const rejectedCount = reviews.filter(r => r.status === 'rejected').length;
```

---

## Storage

### Storage Backend

**Type:** App Builder DB (Document DB)

**Location:** Organization-scoped storage

**Access:** Via `@adobe/aio-lib-db` wrapped by `StateRepository`

### Storage Properties

**Collection:** `reviews`

**Isolation:** Organization-scoped (multi-tenant)

### Storage Isolation

Data is isolated per organization:

```javascript
// Backend action
await repo.put(reviewId, reviewData);
```

### Storage Operations

```javascript
// Initialize storage
const repo = new StateRepository();
await repo.init();

// Store review
await repo.put(reviewId, reviewData);

// Retrieve review
const review = await repo.get(reviewId);

// List reviews (with filters)
const reviews = await repo.find({ sku: 'SKU-12345' });

// Delete review
await repo.delete(reviewId);
```

### Storage Keys

**Review Key:** `{UUID}`

**Example:**
```
uuid: "550e8400-e29b-41d4-a716-446655440000"
Storage Key: "550e8400-e29b-41d4-a716-446655440000"
```

### Benefits

- ✅ Multi-tenant data isolation
- ✅ Automatic organization scoping
- ✅ No cross-organization data access
- ✅ Simple permissions model
- ✅ Scalable architecture

---

## Validation Rules

### Required Fields

All fields except `status` and timestamps are required at creation:

```javascript
const requiredFields = ['sku', 'rating', 'title', 'text', 'author', 'author_email'];
```

### Rating Validation

**Type:** Integer

**Range:** 1-5 (inclusive)

**Validation:**
```javascript
if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
  return { error: "Rating must be a number between 1 and 5" };
}
```

### Email Validation

**Format:** Valid email address

**Validation:**
```javascript
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format for author_email" };
  }
}
```

### SKU Validation

**Type:** String

**Constraints:**
- Non-empty
- Trimmed of whitespace

### Status Validation

**Allowed Values:** `"pending"`, `"approved"`, `"rejected"`

**Default:** `"pending"`

```javascript
const validStatuses = ['pending', 'approved', 'rejected'];
if (status && !validStatuses.includes(status)) {
  return { error: "Invalid status value" };
}
```

### Timestamp Validation

**Type:** ISO 8601 string

**Format:** `"YYYY-MM-DDTHH:mm:ss.sssZ"`

**Auto-generated** on creation and update

```javascript
const now = new Date().toISOString();
// Example: "2025-01-19T10:00:00.000Z"
```

### Full Validation Example

```javascript
function validateReview(review) {
  // Check required fields
  const requiredFields = ['sku', 'rating', 'title', 'text', 'author', 'author_email'];
  const missingFields = requiredFields.filter(field => !review[field]);
  if (missingFields.length > 0) {
    return { error: `Missing required fields: ${missingFields.join(', ')}` };
  }

  // Validate rating
  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
    return { error: "Rating must be a number between 1 and 5" };
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(review.author_email)) {
    return { error: "Invalid email format for author_email" };
  }

  // Validate status (if provided)
  const validStatuses = ['pending', 'approved', 'rejected'];
  if (review.status && !validStatuses.includes(review.status)) {
    return { error: "Invalid status value" };
  }

  return { valid: true };
}
```

---

## Search Index

### Searchable Fields

The following fields are searchable via `get-list-reviews`:

```javascript
const SEARCHABLE_FIELDS = ['sku', 'status', 'rating', 'author', 'author_email', 'text'];
```

### Search Behavior

- **Case-insensitive**: "SKU-123" matches "sku-123"
- **Substring matching**: "SKU" matches "SKU-12345"
- **AND logic**: All filters must match

### Search Examples

```javascript
// Search by SKU (substring)
const results = await getListReviews({ sku: "SKU-123" });

// Search by status
const approved = await getListReviews({ status: "approved" });

// Multiple filters
const results = await getListReviews({
  sku: "SKU-123",
  status: "approved",
  rating: 5
});
```

---

## Data Relationships

### Review Lifecycle

```
┌─────────────┐
│  Created    │ status: pending
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Moderated  │
└──────┬──────┘
       │
       ├─────────────┐
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│  Approved   │ │  Rejected   │
└─────────────┘ └─────────────┘
```

### Timestamp Behavior

- `created_at`: Set once on creation, never changes
- `updated_at`: Updated on every update operation

```javascript
// On create
review.created_at = now;
review.updated_at = now;

// On update
review.updated_at = new Date().toISOString();
// created_at remains unchanged
```

---

## Summary

Data Model Features:
- ✅ Complete type definitions
- ✅ Validation rules for all fields
- ✅ Multi-tenant storage isolation
- ✅ Unique ID generation
- ✅ Timestamp tracking
- ✅ Status workflow
- ✅ Searchable fields

**Next Steps:**
- For API usage, see [API.md](API.md)
- For storage details, see code in `actions/state-repository.js`
- For validation, see code in `actions/review.js`

---

## UI logging
UI log level is controlled via `window.APP_CONFIG.LOG_LEVEL` in `web-src/index.html` (e.g. `debug`, `info`, `warn`, `error`).
