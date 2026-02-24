# Troubleshooting Guide

## Table of Contents
1. [Common Issues](#common-issues)
2. [Debug Logging](#debug-logging)
3. [Performance Issues](#performance-issues)
4. [API Issues](#api-issues)
5. [UI Issues](#ui-issues)
6. [Authentication Issues](#authentication-issues)

---

## Common Issues

### 401 Unauthorized on API Calls

**Problem:** API returns 401 error

**Possible Causes:**
- Missing `Authorization` header
- Expired IMS token
- Invalid token format
- Incorrect organization ID

**Solutions:**

1. **Verify headers are present:**
   ```javascript
   headers: {
     'Authorization': 'Bearer {token}',
     'x-gw-ims-org-id': '{org_id}',
     'Content-Type': 'application/json'
   }
   ```

2. **Check user is logged into Experience Cloud:**
   - Log out and log back in
   - Verify session is active

3. **Check token format:**
   - Must be `Bearer {token}` (not just `{token}`)
   - No extra spaces or quotes

4. **Ensure IMS token is not expired:**
   - Refresh token if needed
   - Check token expiration time

5. **For custom integrations:**
   - Verify token is obtained via Adobe IMS OAuth
   - Check token has required scopes

---

### Missing Required Fields

**Problem:** API returns 400 error "Missing required review fields"

**Solution:** Ensure all required fields are present in request body:

```javascript
{
  "sku": "SKU-12345",           // Required
  "rating": 5,                  // Required
  "title": "Great product!",    // Required
  "text": "Excellent quality",  // Required
  "author": "John Doe",         // Required
  "author_email": "john@example.com"  // Required
}
```

**Common Mistakes:**
- Missing `author_email` field
- Empty strings for required fields
- Using `null` instead of values
- Incorrect field names (e.g., `email` instead of `author_email`)

---

### Invalid Email Format

**Problem:** API returns 400 error "Invalid email format for author_email"

**Solution:** Validate email format before sending:

**Valid Emails:**
- `user@example.com`
- `first.last@domain.co.uk`
- `user+tag@example.org`

**Invalid Emails:**
- `user` (missing @)
- `user@` (missing domain)
- `@example.com` (missing user)
- `user example.com` (missing @)
- `user@example` (missing TLD)

**Validation:**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return { error: "Invalid email format" };
}
```

---

### Invalid Rating

**Problem:** API returns 400 error "Rating must be a number between 1 and 5"

**Solution:** Ensure rating is:
- Integer (not decimal: `5` not `5.0`)
- Between 1 and 5 (inclusive)
- Not a string (`5` not `"5"`)

**Valid Ratings:**
- `1`, `2`, `3`, `4`, `5`

**Invalid Ratings:**
- `0`, `6`, `7` (out of range)
- `3.5`, `4.2` (not integer)
- `"5"`, `"3"` (string, not number)

---

### Review Not Found

**Problem:** API returns 200 but review is missing from response

**Possible Causes:**
- Incorrect review ID
- Review belongs to different organization
- Review has been deleted
- Wrong namespace

**Solutions:**

1. **Verify review ID is correct:**
   ```javascript
   // Format: {UUID}
   const reviewId = "550e8400-e29b-41d4-a716-446655440000";
   ```

2. **Check organization:**
   - Verify you're using correct organization ID
   - Ensure review was created in your org
   - Check multi-tenancy is working

3. **Verify review exists:**
   - Check review hasn't been deleted
   - Try listing all reviews
   - Use `get-list-reviews` to verify

4. **Check namespace:**
   - Verify correct namespace in URL
   - Check `aio app use --list`
   - Ensure using correct workspace

---

## Debug Logging

### Enable Verbose Logging

**Local Development:**
```bash
aio app dev
```

**Environment Variable:**
```bash
LOG_LEVEL=info npm run e2e
```

**Production (via Adobe IO Console):**

1. Go to Adobe IO Console
2. Select project → Workspace → Runtime
3. Set `LOG_LEVEL=info`
4. Re-deploy: `aio app deploy`

### Log Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| `error` | Only critical errors | Production monitoring |
| `warn` | Warnings and errors | Recommended for production |
| `info` | All logs including info | Debugging production issues |
| `debug` | All logs including debug | Development |

### Checking Logs

**Local Development:**
```bash
aio app dev
# Logs appear in terminal
```

**Production:**
```bash
aio runtime:log <action-name>
```

### Log Example

```
[INFO] create-review: Creating review with SKU: SKU-12345
[INFO] create-review: Generated review ID: 550e8400-e29b-41d4-a716-446655440000
[INFO] create-review: Storing review in state
[INFO] create-review: Review created successfully
```

---

## Performance Issues

### Slow API Responses

**Possible Causes:**
1. Large number of reviews (all returned in single call)
2. Network latency to Adobe I/O Runtime
3. Cold starts of serverless actions
4. Inefficient queries

**Solutions:**

1. **Use focused queries:**
   ```javascript
   // Better
   await getListReviews({ sku: 'SKU-12345' });
   ```

2. **Implement pagination (future enhancement):**
   - Add `limit` and `offset` parameters
   - Return reviews in batches
   - Reduce response size

3. **Add caching layer:**
   - Cache frequently accessed reviews
   - Use Redis or similar
   - Set appropriate TTL

4. **Optimize queries:**
   - Use `get-list-reviews` with filters
   - Filter at API level
   - Avoid client-side filtering

### Cold Starts

**Problem:** First request after inactivity is slow

**Solutions:**
- Keep actions warm (scheduled pings)
- Use provisioned concurrency (if available)
- Accept cold start as normal behavior

### Large Responses

**Problem:** API returns too much data

**Solutions:**
1. Use specific queries instead of list-all
2. Implement pagination
3. Select only required fields (GraphQL)
4. Add field selection to REST

---

## API Issues

### Connection Timeout

**Problem:** API call times out

**Solutions:**
1. Check network connectivity
2. Verify Adobe I/O Runtime is accessible
3. Increase timeout in client
4. Check if action is deployed

### 500 Internal Server Error

**Problem:** Server returns 500 error

**Solutions:**
1. Check action logs for errors
2. Verify dependencies are installed
3. Check state storage connectivity
4. Review code for unhandled exceptions

### Batch Operation Partial Failure

**Problem:** Some batch operations fail, others succeed

**Solutions:**
1. Check `results` array for details
2. Review individual item errors
3. Verify all IDs exist
4. Check validation for each item

```javascript
// Batch response
{
  "results": [
    { "id": "id1", "success": true },
    { "id": "id2", "success": false, "error": "Review not found" }
  ]
}
```

---

## UI Issues

### UI Won't Load

**Problem:** Blank page or loading spinner stuck

**Solutions:**

1. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Look for JavaScript errors

2. **Verify `aio app run` is running:**
   - Check terminal for errors
   - Ensure port 9080 is available
   - Restart the server

3. **Check network requests:**
   - Open Network tab in DevTools
   - Look for failed requests
   - Check response codes

4. **Clear browser cache:**
   - Hard refresh (Ctrl+Shift+R)
   - Clear cache and cookies
   - Try incognito mode

### API Calls Failing from UI

**Problem:** 401/403 errors on API calls

**Solutions:**

1. **Verify `props.ims` is available:**
   ```javascript
   console.log(props.ims); // Should have token and org
   ```

2. **Check user is logged in:**
   - Log out and log back in
   - Verify Experience Cloud session

3. **Verify token format:**
   - Should be `Bearer {token}`
   - Check no extra spaces

4. **Check organization ID:**
   - Matches current workspace
   - Format is correct

### Table Not Showing Data

**Problem:** Empty table despite API returning data

**Solutions:**

1. **Check API response:**
   - Use Network tab to inspect
   - Verify JSON structure
   - Check response body

2. **Verify data mapping:**
   - Check field names match
   - Verify array structure
   - Look for undefined values

3. **Check for JavaScript errors:**
   - Open Console tab
   - Look for rendering errors
   - Check React warnings

4. **Verify state is set:**
   ```javascript
   console.log(reviews); // Should be array
   console.log(reviews.length); // Should be > 0
   ```

### Form Not Submitting

**Problem:** Submit button doesn't create review

**Solutions:**

1. **Check form validation:**
   - Verify all required fields filled
   - Check email format is valid
   - Look for validation errors

2. **Check submit handler:**
   ```javascript
   console.log('Form submitted');
   console.log(formData); // Should have values
   ```

3. **Verify API endpoint:**
   - Check URL is correct
   - Verify method is POST
   - Check headers are included

4. **Check response:**
   - Look for success/error response
   - Check status code
   - Review error messages

---

## Authentication Issues

### Token Expiration

**Problem:** Tokens expire after 24 hours

**Solutions:**

1. **Implement token refresh:**
   ```javascript
   async function refreshAccessToken(refreshToken) {
     const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
       method: 'POST',
       body: new URLSearchParams({
         client_id: CLIENT_ID,
         client_secret: CLIENT_SECRET,
         refresh_token: refreshToken,
         grant_type: 'refresh_token'
       })
     });
     return response.json().access_token;
   }
   ```

2. **Handle 401 errors gracefully:**
   ```javascript
   try {
     const response = await fetch(url, options);
     if (response.status === 401) {
       const newToken = await refreshAccessToken(refreshToken);
       retry with newToken;
     }
   } catch (error) {
     // Handle error
   }
   ```

### Invalid Token

**Problem:** Token format is invalid

**Solutions:**

1. **Check token format:**
   - Must be `Bearer {token}`
   - No extra spaces
   - No quotes around token

2. **Verify token source:**
   - Adobe IMS OAuth
   - Experience Cloud session
   - Not manually crafted

### Organization ID Issues

**Problem:** Wrong organization ID

**Solutions:**

1. **Check organization ID:**
   - Verify in Adobe IO Console
   - Match with workspace
   - Check format (e.g., "12345@AdobeOrg")

2. **Verify multi-tenancy:**
   - Ensure correct org is used
   - Check data isolation
   - Verify org-scoped storage

---

## Development Environment Issues

### Port Already in Use

**Problem:** Port 9080 is already in use

**Solution:**
```bash
# Find process using port
lsof -i :9080

# Kill process
kill -9 <PID>

# Or use different port
PORT=9090 aio app run
```

### Dependencies Not Installing

**Problem:** `npm install` fails

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

2. **Delete node_modules:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version:**
   ```bash
   node --version  # Should be 14+
   ```

4. **Use npm legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

### Tests Failing

**Problem:** Unit tests not passing

**Solutions:**

1. **Check test output:**
   ```bash
   npm test
   # Look for specific test failures
   ```

2. **Run tests with verbose output:**
   ```bash
   npm test -- --verbose
   ```

3. **Check for environment issues:**
   - Ensure dependencies installed
   - Check Node.js version
   - Verify test configuration

4. **Run specific test file:**
   ```bash
   npm test -- <path-to-test-file>
   ```

---

## Deployment Issues

### Deployment Fails

**Problem:** `aio app deploy` fails

**Solutions:**

1. **Check workspace:**
   ```bash
   aio app use --list
   ```

2. **Verify authentication:**
   ```bash
   aio auth:login
   ```

3. **Check network connection:**
   - Ensure internet access
   - Check firewall settings
   - Verify Adobe services are accessible

4. **Review deployment logs:**
   - Look for specific errors
   - Check action compilation
   - Verify no syntax errors

### Undeploy Fails

**Problem:** `aio app undeploy` fails

**Solutions:**

1. **Force undeploy:**
   ```bash
   aio app undeploy --yes
   ```

2. **Check for locked resources:**
   - Verify no active deployments
   - Check for running actions

3. **Manual cleanup:**
   - Use Adobe IO Console
   - Delete actions manually
   - Remove static files

---

## Summary

Common troubleshooting areas:
- ✅ Authentication issues (401/403)
- ✅ Validation errors (400)
- ✅ Performance problems
- ✅ UI rendering issues
- ✅ API connectivity
- ✅ Deployment problems

**Next Steps:**
- Enable debug logging for specific issues
- Check logs for error details
- Verify configuration settings
- Test in isolation when possible
