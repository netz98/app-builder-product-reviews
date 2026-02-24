# UI Usage Guide

## Table of Contents
1. [Accessing the UI](#accessing-the-ui)
2. [UI Features](#ui-features)
3. [Authentication](#authentication)
4. [Custom Integration](#custom-integration)

---

## Accessing the UI

### Local Development

```bash
aio app run
```

UI runs on: `http://localhost:9080`

### Production

Deployed via Commerce Backend UI extension configuration.

### Difference: `run` vs `dev`

- `aio app run`: Frontend runs locally, actions are deployed to remote runtime
- `aio app dev`: Both frontend and actions run locally (for full debugging)

---

## UI Features

### Main Components

#### 1. Reviews Table

- Displays all reviews in a sortable table
- Columns: Author, Email, SKU, Rating, Title, Status, Created At, Updated At
- Supports multi-select for batch actions

**Features:**
- Sortable columns
- Row selection
- Status badges (color-coded)
- Responsive design

#### 2. Search Toolbar

- Filter reviews by SKU
- Clear filters button

**Usage:**
1. Enter SKU in search box
2. Press Enter or click Search
3. Results filter automatically
4. Click Clear to reset

#### 3. Create Review Form

- Form fields: SKU, Rating (1-5), Title, Text, Author, Email
- Client-side validation
- Submit button to create review

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-------------|
| SKU | Text | Yes | Non-empty |
| Rating | Number (1-5) | Yes | Integer 1-5 |
| Title | Text | Yes | Non-empty |
| Text | Textarea | Yes | Non-empty |
| Author | Text | Yes | Non-empty |
| Email | Email | Yes | Valid email format |

#### 4. Edit Review Modal

- Edit any review in a modal dialog
- Update status, rating, title, text
- Save and Cancel buttons

**Editable Fields:**
- Status (dropdown: pending, approved, rejected)
- Rating (number input: 1-5)
- Title (text input)
- Text (textarea)

**Read-only Fields:**
- SKU
- Author
- Author Email
- Created At

#### 5. Mass Actions Toolbar

- Approve multiple reviews
- Reject multiple reviews
- Delete multiple reviews

**Usage:**
1. Select multiple reviews in table
2. Choose action from toolbar
3. Confirm action
4. Reviews update automatically

#### 6. Status Badges

- Visual indicators for review status
- Colors: Green (approved), Red (rejected), Yellow (pending)

**Status Colors:**
- Approved: Green
- Rejected: Red
- Pending: Yellow

---

## Authentication

### Commerce Backend UI Access

When accessed from Commerce Backend UI, the UI automatically receives authentication context:

```
Authentication Flow:
1. User logs into Commerce Admin
2. User navigates to Reviews extension
3. Experience Cloud Shell injects props.ims
4. UI automatically includes auth headers in API calls
5. API validates authentication on server-side
```

### Props Received

```javascript
props.ims = {
  token: "Bearer {IMS_TOKEN}",
  org: "ORG_ID"
}
```

### Usage Example

```javascript
// In your React component
const { ims } = props;

// API call with auth headers
const response = await fetch('/api/v1/web/review-app/get-list-reviews', {
  method: 'POST',
  headers: {
    'Authorization': ims.token,
    'x-gw-ims-org-id': ims.org,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});
```

### Benefits

- ✅ No manual authentication setup required
- ✅ Automatic token management
- ✅ Seamless integration with Experience Cloud
- ✅ Multi-tenant support out of the box

---

## Custom Integration

### Building a Custom UI

If you want to build a custom UI (e.g., in Magento or another system):

#### Authentication Required

All API calls must include authentication headers:

```bash
Authorization: Bearer {IMS_TOKEN}
x-gw-ims-org-id: {ORG_ID}
```

#### Example cURL from Custom PHP Application

```bash
curl -X POST \
  "https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review-app/create-review" \
  -H "Authorization: Bearer {TOKEN_FROM_MAGENTO_SESSION}" \
  -H "x-gw-ims-org-id: {ORG_FROM_MAGENTO_CONFIG}" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-12345",
    "rating": 5,
    "title": "Test",
    "text": "Test",
    "author": "Test",
    "author_email": "test@example.com"
  }'
```

#### PHP Integration Example

```php
<?php
class ReviewsApiClient {
    private $baseUrl;
    private $token;
    private $orgId;

    public function __construct($baseUrl, $token, $orgId) {
        $this->baseUrl = $baseUrl;
        $this->token = $token;
        $this->orgId = $orgId;
    }

    private function request($endpoint, $data = []) {
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->token,
            'x-gw-ims-org-id: ' . $this->orgId,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($statusCode === 401) {
            throw new Exception('Unauthorized - Check IMS token');
        }

        return json_decode($response, true);
    }

    public function createReview($data) {
        return $this->request('/create-review', $data);
    }

    public function getListReviews($filters = []) {
        return $this->request('/get-list-reviews', $filters);
    }

    public function updateReviews($reviews) {
        return $this->request('/update-reviews', ['reviews' => $reviews]);
    }

    public function deleteReviews($ids) {
        return $this->request('/delete-reviews-by-ids', ['ids' => $ids]);
    }
}

// Usage
$api = new ReviewsApiClient(
    'https://NAMESPACE.adobeioruntime.net/api/v1/web/review-app',
    $imsToken,  // Get from your session or OAuth flow
    $orgId      // Get from your configuration
);

// Create review
$review = $api->createReview([
    'sku' => 'SKU-12345',
    'rating' => 5,
    'title' => 'Great product!',
    'text' => 'Excellent quality',
    'author' => 'John Doe',
    'author_email' => 'john@example.com'
]);

print_r($review);
?>
```

---

## Component Structure

### File Organization

```
web-src/src/
├── components/
│   ├── Action/
│   │   ├── ReviewForm.jsx       # Create review form
│   │   ├── EditReview.jsx       # Edit review modal
│   │   └── MassActions.jsx      # Batch actions
│   ├── App/
│   │   └── index.jsx            # Main app component
│   └── ReviewsTable/
│       ├── index.jsx            # Reviews table
│       └── columns.jsx          # Table columns config
├── styles/
│   └── theme.css                # Custom styles
└── utils/
    ├── api.js                   # API helper functions
    └── constants.js             # Constants and enums
```

### Key Components

#### ReviewForm

Creates new reviews with validation.

```javascript
import { ActionButton, Form, TextField } from '@adobe/react-spectrum';

export function ReviewForm({ onSubmit, ims }) {
  const handleSubmit = async (data) => {
    const response = await fetch('/api/v1/web/review-app/create-review', {
      method: 'POST',
      headers: {
        'Authorization': ims.token,
        'x-gw-ims-org-id': ims.org,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    onSubmit(await response.json());
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Form fields */}
      <ActionButton type="submit">Create Review</ActionButton>
    </Form>
  );
}
```

#### EditReview

Edits existing reviews in a modal.

```javascript
import { Dialog, Form, TextField } from '@adobe/react-spectrum';

export function EditReview({ review, ims, onClose }) {
  const handleSave = async (data) => {
    await fetch('/api/v1/web/review-app/update-reviews', {
      method: 'POST',
      headers: {
        'Authorization': ims.token,
        'x-gw-ims-org-id': ims.org,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reviews: [{ id: review.id, ...data }]
      })
    });
    onClose();
  };

  return (
    <Dialog>
      <Form onSubmit={handleSave}>
        {/* Editable fields */}
      </Form>
    </Dialog>
  );
}
```

#### ReviewsTable

Displays reviews in a sortable table.

```javascript
import { Table } from '@adobe/react-spectrum';

export function ReviewsTable({ reviews, ims }) {
  return (
    <Table>
      <Table.Header>
        <Table.Column>Author</Table.Column>
        <Table.Column>Email</Table.Column>
        <Table.Column>SKU</Table.Column>
        <Table.Column>Rating</Table.Column>
        <Table.Column>Title</Table.Column>
        <Table.Column>Status</Table.Column>
      </Table.Header>
      <Table.Body>
        {reviews.map(review => (
          <Table.Row key={review.id}>
            <Table.Cell>{review.author}</Table.Cell>
            <Table.Cell>{review.author_email}</Table.Cell>
            <Table.Cell>{review.sku}</Table.Cell>
            <Table.Cell>{review.rating}</Table.Cell>
            <Table.Cell>{review.title}</Table.Cell>
            <Table.Cell>
              <StatusBadge status={review.status} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
```

---

## Common UI Patterns

### Loading States

```javascript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await fetchReviews();
    setReviews(data);
  } finally {
    setLoading(false);
  }
};

return loading ? <ProgressCircle /> : <ReviewsTable reviews={reviews} />;
```

### Error Handling

```javascript
const [error, setError] = useState(null);

const handleAction = async () => {
  try {
    await updateReviews();
  } catch (err) {
    setError(err.message);
    showToast('error', 'Failed to update reviews');
  }
};
```

### Pagination (Future)

```javascript
const [page, setPage] = useState(0);
const [pageSize] = useState(50);

const paginatedReviews = reviews.slice(
  page * pageSize,
  (page + 1) * pageSize
);
```

---

## Troubleshooting UI Issues

### Common Problems

#### UI Won't Load

**Problem:** Blank page or loading spinner stuck

**Solutions:**
1. Check browser console for errors
2. Verify `aio app run` is running
3. Check network requests in DevTools
4. Verify authentication headers

#### API Calls Failing

**Problem:** 401/403 errors on API calls

**Solutions:**
1. Verify `props.ims` is available
2. Check user is logged into Experience Cloud
3. Verify token format is correct
4. Check organization ID matches

#### Table Not Showing Data

**Problem:** Empty table despite API returning data

**Solutions:**
1. Check API response format
2. Verify data structure matches expected format
3. Check for JavaScript errors in console
4. Verify `reviews` state is being set

#### Form Not Submitting

**Problem:** Submit button doesn't create review

**Solutions:**
1. Check form validation
2. Verify all required fields are filled
3. Check email format is valid
4. Verify API endpoint is correct

### Debug Mode

Enable verbose logging:

```bash
LOG_LEVEL=debug aio app dev
```

Check browser console and terminal for errors.

---

## Summary

UI Features:
- ✅ React Spectrum components
- ✅ Reviews table with sorting
- ✅ Create/edit review forms
- ✅ Mass actions toolbar
- ✅ Status badges
- ✅ Automatic authentication
- ✅ Multi-tenant support

**Next Steps:**
- For API details, see [API.md](API.md)
- For authentication, see [AUTHENTICATION.md](AUTHENTICATION.md)
- For GraphQL integration, see [GRAPHQL.md](GRAPHQL.md)
