# Phase 4: JWT + API-Key Dual Authentication & Mini RBAC

## Overview

Phase 4 implements **dual-factor authentication**: every protected request must present **both** a valid JWT **and** a valid API key. The JWT carries the role as a cryptographically signed claim (source of truth for authorization), while the API key acts as a second factor proving the client is a legitimate system.

**Status:** ✅ Implemented (dual-auth model)

---

## How It Works

```
Client sends two headers:
  Authorization: Bearer <jwt-token>
  X-API-Key: <api-key>
                │                              │
                ▼                              ▼
        verifyJwt(jwt, JWT_SECRET)    validApiKeys.has(key)
                │                              │
                ▼                              ▼
        Extract role from payload       API key is valid
                │                              │
                └──────────┬───────────────────┘
                           ▼
                 Both valid? role ∈ allowedRoles?
                           │
                     ┌─────┴─────┐
                     ▼             ▼
                   YES            NO
                     │             │
                     ▼             ▼
                 next()     401 / 403
```

**Key behaviors:**
- **Both** JWT and API-key MUST be present — missing either → 401
- **Both** MUST be valid — invalid JWT signature or unknown API key → 401
- JWT role determines authorization — if not in allowedRoles → 403
- `/health` remains public (no auth required)

## Required Headers

| Header | Format | Example |
|---|---|---|
| `Authorization` | `Bearer <jwt-token>` | `Bearer eyJhbGciOiJIUzI1NiIs...` |
| `X-API-Key` | `<api-key>` | `a3h0LbpW0kaf84M8SzefP4O-ldantfhm` |

## JWT Structure

**Algorithm:** HS256 (HMAC-SHA256)  
**Library:** Node.js built-in `crypto` — zero external dependencies  
**Expiration:** 365 days from issuance

```json
{
  "sub": "vehicle-stock-platform",
  "role": "<admin|ops|branch>",
  "iat": 1784923612,
  "exp": 1816459612
}
```

## Environment Configuration

```bash
# Both JWT_SECRET and API_KEYS are required
JWT_SECRET="8byUYQ9VcG38QLNZKJLQtUBJJvq3E4tURaa8vnvGVuXWc5JT6S4zuDNEAivr7P_4jHywVlmbhUyc0KGYPdHBbA"
API_KEYS="admin:a3h0LbpW0kaf84M8SzefP4O-ldantfhm,ops:usG95gkLp6Bi4KC6t4S7oE62OmGS0WyT,branch:ZBwdtFQs4DB-vcpt0P0KAVtA6_sT1t3t"
```

| Variable | Required | Purpose |
|---|---|---|
| `JWT_SECRET` | **Yes** | HS256 secret for signing and verifying JWTs |
| `API_KEYS` | **Yes** | Comma-separated `role:key` pairs for API key verification |

## Token Generation

JWTs are generated and distributed to clients out-of-band. To generate tokens:

```bash
# Using the generate script
npm run jwt:generate

# Or with Node.js directly
node -e "
const crypto = require('crypto');
const secret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('base64url');
function signJwt(role, secret) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: 'vehicle-stock-platform', role, iat: now, exp: now + 365*24*60*60 };
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const eh = enc(header), ep = enc(payload);
  const sig = crypto.createHmac('sha256', secret).update(eh + '.' + ep).digest('base64url');
  return eh + '.' + ep + '.' + sig;
}
console.log('Admin:', signJwt('admin', secret));
"
```

## Role ↔ Endpoint Matrix

| Role | POST /vehicles | GET /vehicles | GET /vehicles/:id | GET /dashboard | GET /integration-logs | GET /health |
|---|---|---|---|---|---|---|
| **branch** | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **ops** | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **admin** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **public** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

## Usage Examples

```bash
# Admin accessing dashboard (both headers required)
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
     -H "X-API-Key: a3h0LbpW0kaf84M8SzefP4O-ldantfhm" \
     http://localhost:6300/api/dashboard/summary

# Branch system posting vehicle data
curl -X POST \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
     -H "X-API-Key: ZBwdtFQs4DB-vcpt0P0KAVtA6_sT1t3t" \
     -H "Content-Type: application/json" \
     -d '{"external_id":"ADM-001","company_code":"PT-AKA",...}' \
     http://localhost:6300/api/vehicles

# Health check — no auth needed
curl http://localhost:6300/health
```

## Files

| File | Purpose |
|---|---|
| `src/lib/jwt.ts` | `signJwt()`, `verifyJwt()`, `looksLikeJwt()` — HS256 via Node `crypto` |
| `src/config/env.ts` | `JWT_SECRET` (required), `validApiKeys` Map |
| `src/middleware/auth.ts` | Dual-header verification: JWT signature + API-key lookup |
| `scripts/generate-jwt.ts` | CLI token generator (`npm run jwt:generate`) |
| `tests/helpers/auth.ts` | Test auth helper — `authHeaders(role)` |
| `tests/unit/lib/jwt.test.ts` | 19 JWT library unit tests |
| `tests/integration/auth-jwt.test.ts` | 15 dual-auth integration tests |

## Security

| Concern | Mitigation |
|---|---|
| JWT secret exposure | `.env` is in `.gitignore`; rotate secret to mass-revoke |
| Long-lived tokens (365 days) | Trade-off for no-login UX; use short-lived tokens in production if needed |
| No token revocation list | Acceptable for MVP; rotate `JWT_SECRET` to mass-revoke |
| HS256 symmetric | Single-service backend; shared secret stays server-side |
| Timing attacks on HMAC | `crypto.timingSafeEqual` for signature comparison |
| `alg:none` attack | Explicitly rejected — only `HS256` allowed |
| API key in header | Sent over HTTPS in production; same risk profile as Bearer tokens |
| Dual mandatory headers | Missing either → 401; both must be valid |

## Error Responses

| Scenario | Status | Message |
|---|---|---|
| Missing Authorization header | 401 | "Missing or invalid Authorization header — Bearer JWT required" |
| Invalid/expired JWT | 401 | "Invalid or expired JWT" |
| Missing X-API-Key header | 401 | "Missing X-API-Key header" |
| Invalid API key | 401 | "Invalid API key" |
| Role not permitted | 403 | "Role 'branch' not permitted for this endpoint" |
