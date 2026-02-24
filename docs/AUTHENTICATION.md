# Authentication Guide

## Table of Contents
1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Required Headers](#required-headers)
4. [Authentication Responses](#authentication-responses)
5. [Commerce Backend UI Integration](#commerce-backend-ui-integration)
6. [Custom Integration](#custom-integration)

---

## Overview

The application uses Adobe IMS (Identity Management System) for authentication. All API calls require valid authentication headers.

**Key Concepts:**
- **IMS Token**: Access token obtained via Adobe IMS OAuth
- **Organization ID**: Unique identifier for your Adobe organization
- **Multi-Tenancy**: Data is isolated per organization
- **Session Management**: Tokens expire and must be refreshed

---

## Authentication Flow

### 1. User Login
User authenticates through Experience Cloud Shell or Commerce backend UI

### 2. IMS Token
Adobe IMS provides access token and organization ID

### 3. API Calls
All backend actions validate authentication headers

### 4. Multi-Tenancy
Data is isolated per organization

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   User      │ ─────▶  │ Adobe IMS   │ ─────▶  │  App API    │
│ (Login)     │ Token   │ (Auth)      │ Headers │ (Validate)  │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                         ┌─────────────┐
                         │   Storage   │
                         │ (Org-scoped)│
                         └─────────────┘
```

---

## Required Headers

All API requests must include these headers:

```bash
Authorization: Bearer {IMS_ACCESS_TOKEN}
x-gw-ims-org-id: {ORGANIZATION_ID}
Content-Type: application/json
```

### Header Details

**Authorization:**
- Format: `Bearer {token}`
- Token obtained via Adobe IMS OAuth
- Must be valid and not expired

**x-gw-ims-org-id:**
- Your Adobe organization ID
- Determines which data you can access
- Enforces multi-tenancy

**Content-Type:**
- Required for POST/PUT requests
- Must be `application/json`

---

## Authentication Responses

### 401 Unauthorized

**Meaning:** Invalid or missing authentication

**Common Causes:**
- Missing `Authorization` header
- Expired IMS token
- Invalid token format
- Token doesn't have required permissions

**Solutions:**
1. Check user is logged into Experience Cloud
2. Verify headers are included in API calls
3. Ensure organization ID is correct
4. Refresh IMS token if expired

### 403 Forbidden

**Meaning:** Valid auth but insufficient permissions

**Common Causes:**
- User lacks required permissions
- Project not properly configured in Adobe IO Console
- Workspace permissions issue

**Solutions:**
1. Check Adobe IO Console project settings
2. Verify user has App Builder access
3. Ensure project is configured for correct organization

### 200/201 Success

**Meaning:** Authentication successful

API returns expected response data.

---

## Commerce Backend UI Integration

When accessed from Commerce Backend UI, authentication is automatically injected by the Experience Cloud Shell.

### Automatic Authentication

Your component receives authentication context via props:

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
fetch('/api/v1/web/review-app/get-list-reviews', {
  method: 'POST',
  headers: {
    'Authorization': ims.token,
    'x-gw-ims-org-id': ims.org,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
})
```

### Benefits

- ✅ No manual authentication setup required
- ✅ Automatic token management
- ✅ Seamless integration with Experience Cloud
- ✅ Multi-tenant support out of the box

---

## Custom Integration

If building custom integration (e.g., PHP application), you need to:

1. Obtain IMS token via OAuth 2.0
2. Include token and org ID in API headers
3. Handle 401 responses and redirect to login
4. Refresh tokens when expired

### IMS OAuth Flow

#### Step 1: Redirect to Adobe IMS

```
https://ims-na1.adobelogin.com/ims/authorize/v2?
  client_id={CLIENT_ID}
  redirect_uri={REDIRECT_URI}
  scope=openid,AdobeID,read_organizations
  response_type=code
```

#### Step 2: User Authenticates

User logs in with their Adobe credentials.

#### Step 3: Adobe Redirects Back

Adobe redirects to your `redirect_uri` with authorization code:
```
{REDIRECT_URI}?code={AUTHORIZATION_CODE}
```

#### Step 4: Exchange Code for Token

```bash
curl -X POST \
  'https://ims-na1.adobelogin.com/ims/token/v3' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id={CLIENT_ID}' \
  -d 'client_secret={CLIENT_SECRET}' \
  -d 'code={AUTHORIZATION_CODE}' \
  -d 'redirect_uri={REDIRECT_URI}' \
  -d 'grant_type=authorization_code'
```

**Response:**
```json
{
  "access_token": "{IMS_ACCESS_TOKEN}",
  "refresh_token": "{REFRESH_TOKEN}",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

#### Step 5: Use Token in API Calls

```bash
curl -X POST \
  'https://NAMESPACE.adobeioruntime.net/api/v1/web/review-app/create-review' \
  -H 'Authorization: Bearer {IMS_ACCESS_TOKEN}' \
  -H 'x-gw-ims-org-id: {ORG_ID}' \
  -H 'Content-Type: application/json' \
  -d '{"sku": "SKU-12345", "rating": 5, "title": "Test", "text": "Test", "author": "Test", "author_email": "test@example.com"}'
```

#### Step 6: Refresh Token (Optional)

When token expires, use refresh token:

```bash
curl -X POST \
  'https://ims-na1.adobelogin.com/ims/token/v3' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id={CLIENT_ID}' \
  -d 'client_secret={CLIENT_SECRET}' \
  -d 'refresh_token={REFRESH_TOKEN}' \
  -d 'grant_type=refresh_token'
```

---

## PHP Integration Example

### Simple PHP Client

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
}

// Usage
$api = new ReviewsApiClient(
    'https://NAMESPACE.adobeioruntime.net/api/v1/web/review-app',
    $imsToken,  // Get from your session or OAuth flow
    $orgId      // Get from your configuration
);

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

## Token Management

### Token Expiration

- **Access Token**: Valid for 24 hours (86400 seconds)
- **Refresh Token**: Can be used to obtain new access tokens
- **Session Token**: Short-lived, used for UI sessions

### Best Practices

1. **Store tokens securely**: Never log or expose tokens
2. **Handle expiration**: Implement token refresh logic
3. **Use HTTPS**: Always use secure connections
4. **Validate tokens**: Check token validity before use
5. **Revoke tokens**: Invalidate tokens when user logs out

### Refresh Strategy

```javascript
// Example: JavaScript token refresh
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const data = await response.json();
  return data.access_token;
}
```

---

## Multi-Tenancy

### Data Isolation

- Each organization has isolated data
- Storage keys include organization ID
- Cross-org access is prevented
- Enforced at storage and API levels

### Implementation

```javascript
// Backend action
const orgKey = `${orgId}__${reviewKey}`;
await state.put(orgKey, reviewData);
```

### Benefits

- ✅ Secure data separation
- ✅ No cross-organization data leaks
- ✅ Simple permissions model
- ✅ Scalable multi-tenant architecture

---

## Troubleshooting Authentication

### Common Issues

#### "401 Unauthorized"

**Check:**
1. Token is present in headers
2. Token format is `Bearer {token}`
3. Token is not expired
4. User has valid Adobe account

**Solution:** Refresh token and retry

#### "403 Forbidden"

**Check:**
1. User has App Builder access
2. Project configured correctly
3. Organization ID is correct
4. Permissions granted in Adobe IO Console

**Solution:** Check project configuration in Adobe IO Console

#### "Invalid Organization ID"

**Check:**
1. Organization ID format is correct
2. Organization exists
3. User is member of organization

**Solution:** Verify organization ID in Adobe IO Console

### Debug Mode

Enable verbose logging:

```bash
LOG_LEVEL=debug npm run dev
```

Check logs for authentication errors.

---

## Security Best Practices

1. **Never expose tokens**: Don't log or display tokens
2. **Use HTTPS**: Always encrypt network traffic
3. **Validate all requests**: Check headers on every request
4. **Implement rate limiting**: Prevent abuse
5. **Monitor for anomalies**: Watch for unusual activity
6. **Rotate tokens**: Regularly refresh access tokens
7. **Use short-lived tokens**: Minimize exposure window
8. **Revoke on logout**: Invalidate tokens when user logs out

---

## Summary

Authentication in this application:
- ✅ Uses Adobe IMS OAuth 2.0
- ✅ Supports Commerce Backend UI (automatic)
- ✅ Supports custom integrations (manual)
- ✅ Multi-tenant data isolation
- ✅ Secure token management

**Next Steps:**
1. For API details, see [API.md](API.md)
2. For GraphQL integration, see [GRAPHQL.md](GRAPHQL.md)
3. For security details, see [SECURITY.md](SECURITY.md)
