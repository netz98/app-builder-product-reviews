# Authentication Implementation Guide

## Overview

This document describes the authentication implementation for the Adobe App Builder Product Reviews application. The app now uses a unified authentication pattern that automatically handles Adobe IMS (Identity Management System) authentication for all API calls.

## Architecture

### Server-Side Authentication

All serverless actions are protected by Adobe's built-in authentication system:

- **Configuration**: All actions have `require-adobe-auth: true` in `ext.config.yaml`
- **Middleware**: `actions/auth.js` validates authentication headers
- **Validation**: Checks for `Authorization: Bearer {token}` and `x-gw-ims-org-id` headers
- **Multi-tenancy**: Data isolation using organization-scoped keys

### Client-Side Authentication

The frontend automatically injects authentication headers using the Experience Cloud Shell IMS context:

```javascript
// Automatic authentication injection
actionWebInvoke('create-review', props.ims, reviewData, 'post');
```

## Usage

### Frontend Components

#### Recommended Pattern (Automatic Auth)

```javascript
// ✅ Modern approach - pass IMS object directly
const result = await actionWebInvoke('create-review', props.ims, data, 'post');
```

#### Legacy Pattern (Manual Auth)

```javascript
// ⚠️ Still supported but discouraged
const headers = {
  authorization: `Bearer ${props.ims.token}`,
  'x-gw-ims-org-id': props.ims.org
};
const result = await actionWebInvoke('create-review', headers, data, 'post');
```

### actionWebInvoke Function

**Location**: `web-src/utils.js`

**Signature**:
```javascript
export async function actionWebInvoke(actionName, headersOrIms = {}, params = {}, method = 'get')
```

**Parameters**:
- `actionName`: Action name or URL
- `headersOrIms`: Either IMS object (recommended) or headers object (legacy)
- `params`: Request parameters/payload
- `method`: HTTP method ('get', 'post', 'put', etc.)

**Automatic Headers Injected**:
- `Authorization: Bearer {token}`
- `x-gw-ims-org-id: {org}`
- `x-gw-ims-org: {org}` (legacy support)

## Implementation Details

### Authentication Flow

1. **User Login**: User authenticates via Experience Cloud Shell or is redirected to login
2. **IMS Context**: Shell provides `props.ims` with `token` and `org`
3. **Auth Validation**: `AuthGuard` component validates IMS object before rendering protected routes
4. **Auto-injection**: `actionWebInvoke` automatically adds auth headers
5. **Server Validation**: Actions validate headers via `requireAuth()` middleware
6. **Data Access**: Org-scoped keys ensure data isolation
7. **Error Handling**: Auth failures trigger automatic redirect to login page

### Login Redirect Flow

When authentication fails:
1. **Detection**: Only on actual 401 unauthorized responses (not all auth errors)
2. **User Feedback**: Shows "Authentication required. Redirecting to login..." message  
3. **Automatic Redirect**: Redirects to Adobe Experience Cloud login with return URL
4. **Post-Login**: User returns to original page with valid IMS context
5. **No Redirect Loops**: IMS object validation is now permissive for logged-in users

### Route Protection

- **Removed AuthGuard**: Experience Cloud Shell handles authentication automatically
- **Let Shell Manage Auth**: No aggressive route protection that causes login loops
- **API-Level Protection**: Only redirect on actual server-side 401 errors
- **Permissive IMS Detection**: If IMS object exists, assume Experience Cloud handled auth

### Multi-tenant Data Isolation

Server-side actions use organization-scoped keys:

```javascript
// Example: Organization-scoped storage key
const orgKey = `${orgId}_${reviewId}`;
```

This ensures data privacy between different Adobe organizations.

## Migration Guide

### For New Components

Always use the modern IMS object pattern:

```javascript
import { actionWebInvoke } from '../utils';

const MyComponent = (props) => {
  const handleSubmit = async (data) => {
    try {
      const result = await actionWebInvoke('my-action', props.ims, data, 'post');
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
  
  return <div>/* Component JSX */</div>;
};
```

### For Existing Components

Replace manual header construction with IMS object:

**Before**:
```javascript
const headers = { 'x-gw-ims-org': props.ims?.org };
const result = await actionWebInvoke('action', headers, params, 'post');
```

**After**:
```javascript
const result = await actionWebInvoke('action', props.ims, params, 'post');
```

## Security Features

### Built-in Protections

1. **Authentication Required**: All actions require valid Adobe IMS tokens
2. **Organization Isolation**: Data access restricted to user's organization
3. **Automatic Token Injection**: No manual token management needed
4. **Backward Compatibility**: Supports legacy header patterns

### Server-Side Validation

Actions validate authentication via `actions/auth.js`:

```javascript
const authResult = requireAuth(params, logger);
if (!authResult.success) {
  return authResult.error; // 401 Unauthorized
}

const { orgId } = authResult.authContext;
// Proceed with business logic
```

## Testing

### Development

During local development, the app automatically handles localhost-specific headers.

### Authentication Testing

Test authentication scenarios:

1. **Valid User**: Normal operation with logged-in user
2. **Expired Token**: Automatic token refresh via Experience Cloud Shell
3. **Organization Switch**: Shell handles org context changes

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that user is logged into Experience Cloud
2. **Missing Headers**: Ensure `props.ims` is being passed to components
3. **Cross-Org Access**: Data isolation prevents cross-organization access

### Debug Information

Enable logging to see injected headers:

```javascript
console.log('Auth headers being sent:', {
  authorization: `Bearer ${props.ims?.token?.substring(0, 20)}...`,
  'x-gw-ims-org-id': props.ims?.org
});
```

## Best Practices

1. **Always pass `props.ims`**: Never hardcode authentication
2. **Use auto-injection**: Let utils.js handle authentication
3. **Check auth context**: Server-side actions should verify org access
4. **Handle errors**: Catch and display authentication errors to users
5. **Test org isolation**: Verify data privacy between organizations

## Compliance

This implementation follows Adobe App Builder security guidelines:

- ✅ IMS authentication integration
- ✅ Organization-based data isolation
- ✅ Automatic token management
- ✅ Secure header injection
- ✅ Server-side validation

## Files Modified

- `web-src/utils.js` - Enhanced actionWebInvoke with auto-auth
- `web-src/components/ReviewManager.js` - Updated to use IMS object pattern
- `actions/get-list-reviews/index.js` - Fixed lint issues
- `actions/state-test/index.js` - Fixed lint issues

## References

- [Adobe App Builder Security Guidelines](https://developer.adobe.com/app-builder/docs/guides/app_builder_guides/security/)
- [Experience Cloud Shell Integration](https://developer.adobe.com/app-builder/docs/guides/app_builder_guides/exc_app/aec-integration/)