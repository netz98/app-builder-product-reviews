# Security Guide

## Table of Contents
1. [Authentication](#authentication)
2. [Data Privacy](#data-privacy)
3. [Best Practices](#best-practices)
4. [Security Considerations](#security-considerations)
5. [Compliance](#compliance)

---

## Authentication

### Required Authentication

- All API endpoints require authentication
- Multi-tenant data isolation enforced
- Organization-scoped data access
- IMS tokens validated on every request

### Authentication Flow

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

### Token Security

- **Never log tokens**: Don't expose in logs or console output
- **Use HTTPS**: Always encrypt token transmission
- **Short-lived tokens**: Access tokens expire after 24 hours
- **Refresh tokens**: Use refresh tokens to get new access tokens
- **Revoke on logout**: Invalidate tokens when user logs out

### Token Validation

Every request validates:
1. Token presence in `Authorization` header
2. Token format (`Bearer {token}`)
3. Token validity (not expired)
4. Organization ID presence and format

---

## Data Privacy

### Data Isolation

- Reviews are isolated per organization
- No cross-organization data access
- Organization-scoped storage keys
- Enforced at storage and API levels

### Review IDs

**Pattern:** `{UUID}`

**Example:**
```
reviewId: "550e8400-e29b-41d4-a716-446655440000"
```

### Data Handling

**What is stored:**
- Review content (title, text)
- Author name and email
- Rating and status
- Timestamps

**What is NOT stored:**
- Passwords
- Credit card information
- Personally Identifiable Information (PII) beyond email
- Sensitive personal data

### Logging Security

- Sensitive data not logged (email addresses)
- Token values never logged
- User data masked in logs
- Structured logging for security analysis

---

## Best Practices

### Environment Configuration

**Never commit `.env` file:**
```bash
# .gitignore
.env
.env.local
.env.*.local
```

**Use environment variables:**
```bash
# Adobe IO Console
LOG_LEVEL=warn

# Local development
AIO_RUNTIME_AUTH=your-auth-token
AIO_RUNTIME_NAMESPACE=your-namespace
```

### Secrets Management

**Store securely:**
- Use Adobe IO Console for production secrets
- Never hardcode secrets in code
- Use environment variables for configuration
- Rotate secrets regularly

**Example:**
```javascript
// Good
const auth = process.env.AIO_RUNTIME_AUTH;

// Bad
const auth = "Bearer abc123..."; // Never hardcode!
```

### API Security

**Use HTTPS:**
```javascript
// Always use https://
const baseUrl = 'https://namespace.adobeioruntime.net';
```

**Validate inputs:**
```javascript
function validateReview(review) {
  // Validate all inputs
  const requiredFields = ['sku', 'rating', 'title', 'text', 'author', 'author_email'];
  const missingFields = requiredFields.filter(field => !review[field]);
  if (missingFields.length > 0) {
    throw new Error('Missing required fields');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(review.author_email)) {
    throw new Error('Invalid email format');
  }

  // Validate rating
  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
    throw new Error('Invalid rating');
  }
}
```

**Sanitize outputs:**
```javascript
function sanitizeReview(review) {
  return {
    id: review.id,
    sku: review.sku,
    rating: review.rating,
    title: review.title,
    text: review.text,
    author: review.author,
    author_email: maskEmail(review.author_email), // Mask email in logs
    status: review.status,
    created_at: review.created_at,
    updated_at: review.updated_at
  };
}

function maskEmail(email) {
  const [user, domain] = email.split('@');
  return `${user[0]}***@${domain}`;
}
```

### Rate Limiting

**Consider implementing:**
- Request rate limits per organization
- Throttling for API endpoints
- Quota management
- Abuse detection

**Example (future):**
```javascript
const rateLimiter = require('express-rate-limit');

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  keyGenerator: (req) => req.headers['x-gw-ims-org-id']
});
```

---

## Security Considerations

### Input Validation

**Required fields validation:**
- Check all required fields present
- Validate data types
- Check value ranges

**Example:**
```javascript
const requiredFields = ['sku', 'rating', 'title', 'text', 'author', 'author_email'];
const missingFields = requiredFields.filter(field => !review[field]);
if (missingFields.length > 0) {
  return { statusCode: 400, body: { error: 'Missing required fields' } };
}
```

### Output Sanitization

**Prevent XSS:**
- Escape HTML in user-generated content
- Sanitize text before rendering
- Use React's built-in escaping

```javascript
// React automatically escapes HTML
<div>{review.text}</div>
```

### SQL Injection Prevention

**Not applicable** - This application uses key-value storage (Adobe I/O State), not SQL database.

### Cross-Site Request Forgery (CSRF)

**Protection:**
- Use SameSite cookie attributes
- Verify Origin headers
- Implement CSRF tokens for state-changing operations

### HTTPS Enforcement

**Always use HTTPS:**
```javascript
// Redirect HTTP to HTTPS
if (req.protocol === 'http') {
  return res.redirect(`https://${req.headers.host}${req.url}`);
}
```

### Content Security Policy (CSP)

**Implement CSP headers:**
```javascript
headers: {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
}
```

---

## Compliance

### Data Protection

**GDPR Considerations:**
- Data is stored in Adobe I/O State
- Organization-scoped data isolation
- No cross-organization data sharing
- User data (email) is necessary for review management

**Data Retention:**
- Reviews stored for 365 days (TTL)
- After TTL, data is automatically deleted
- Organizations can delete reviews at any time

**Right to Delete:**
- Users can request review deletion
- Delete by ID endpoint available
- Batch delete for multiple reviews

### Access Control

**Multi-Tenancy:**
- Each organization sees only its own data
- Organization ID enforced at storage level
- Cross-org access prevented

**Authorization:**
- All requests require valid IMS token
- Token validated on every request
- Organization ID checked for authorization

### Audit Logging

**Current implementation:**
- Structured logging for actions
- Error logging for failures
- Operation tracking (create, update, delete)

**Future enhancements:**
- Audit trail for all operations
- Timestamped access logs
- Change tracking for reviews

---

## Security Checklist

### Development

- [ ] Never commit `.env` file
- [ ] Use environment variables for secrets
- [ ] Validate all user inputs
- [ ] Sanitize all outputs
- [ ] Use HTTPS for all API calls
- [ ] Implement error handling
- [ ] Add rate limiting (future)
- [ ] Use secure dependencies

### Deployment

- [ ] Set `LOG_LEVEL=warn` or `error` in production
- [ ] Verify environment variables are set
- [ ] Test authentication flow
- [ ] Verify multi-tenancy is working
- [ ] Check HTTPS is enforced
- [ ] Review access controls
- [ ] Test with different organizations
- [ ] Verify data isolation

### Operations

- [ ] Monitor for unauthorized access attempts
- [ ] Rotate IMS tokens regularly
- [ ] Review logs for suspicious activity
- [ ] Update dependencies regularly
- [ ] Monitor performance and errors
- [ ] Backup critical configurations
- [ ] Document incident response procedures
- [ ] Regular security audits

---

## Incident Response

### Security Incident

**If you detect a security issue:**

1. **Immediate actions:**
   - Log the incident
   - Assess impact
   - Notify stakeholders

2. **Containment:**
   - Isolate affected systems
   - Revoke compromised tokens
   - Disable affected accounts

3. **Investigation:**
   - Review logs
   - Identify root cause
   - Assess data exposure

4. **Remediation:**
   - Patch vulnerabilities
   - Update security measures
   - Document lessons learned

### Data Breach

**If a data breach occurs:**

1. **Immediate actions:**
   - Stop data access
   - Preserve evidence
   - Notify authorities (if required)

2. **Communication:**
   - Notify affected users
   - Provide guidance
   - Document communications

3. **Recovery:**
   - Restore from backups
   - Validate system integrity
   - Update security measures

---

## Summary

Security Features:
- ✅ Adobe IMS authentication
- ✅ Multi-tenant data isolation
- ✅ Input validation and output sanitization
- ✅ HTTPS enforcement
- ✅ Secure token management
- ✅ Organization-scoped storage
- ✅ Structured logging (no sensitive data)
- ✅ Rate limiting (future enhancement)

**Next Steps:**
- For authentication details, see [AUTHENTICATION.md](AUTHENTICATION.md)
- For data model, see [DATA_MODEL.md](DATA_MODEL.md)
- For troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Security Resources:**
- [Adobe Security Best Practices](https://www.adobe.com/devnet-docs/acrobatetk/tools/Sign/Security/overview.html)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

## UI logging
UI log level is controlled via `window.APP_CONFIG.LOG_LEVEL` in `web-src/index.html` (e.g. `debug`, `info`, `warn`, `error`).
