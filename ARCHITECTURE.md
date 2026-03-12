# Analytic Armory — Architecture & Integration

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    analyticarmory.com (Portal)              │
│                    Vercel | Next.js 14                      │
│   - Landing page & app hub                                  │
│   - Theme system (dark/light)                               │
│   - Session dashboard                                       │
│   - Platform status                                         │
└────────────┬──────────────────────────┬──────────────────────┘
             │                          │
    ┌────────▼────────┐      ┌──────────▼─────────┐
    │   compass.      │      │   dios.            │
    │   analyticarmory│      │   analyticarmory   │
    │   .com          │      │   .com             │
    │ ┌───────────┐   │      │ ┌──────────────┐   │
    │ │ Compass   │   │      │ │ DIOS         │   │
    │ │ Tech      │   │      │ │ Decision     │   │
    │ │ Assessment│   │      │ │ Intelligence │   │
    │ └───────────┘   │      │ └──────────────┘   │
    │ Auth: Session   │      │ Auth: JWT          │
    │                 │      │                    │
    └─────────────────┘      └────────────────────┘
             │                          │
             └──────────┬───────────────┘
                        │
              ┌─────────▼──────────┐
              │  GCP Cloud SQL     │
              │  PostgreSQL        │
              │                    │
              │  Shared Tables:    │
              │  - user            │
              │  - organization    │
              │  - user_role       │
              │  - session         │
              │  - password_reset  │
              │  - invite_token    │
              │                    │
              │  App-Specific:     │
              │  - dios_*          │
              │  - compass_*       │
              └────────────────────┘
```

---

## Database Schema

### Shared Tables (No Prefix)

```sql
-- User accounts
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations
CREATE TABLE organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Organization membership
CREATE TABLE user_role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  organization_id UUID NOT NULL REFERENCES organization(id),
  role VARCHAR(50) DEFAULT 'analyst',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session management
CREATE TABLE session (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id),
  app VARCHAR(50), -- 'portal', 'compass', 'dios'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_token (
  token VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invite tokens for new users
CREATE TABLE invite_token (
  token VARCHAR(255) PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organization(id),
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### DIOS App Tables (dios_* prefix)

```sql
CREATE TABLE dios_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  session_id VARCHAR(255),
  topic VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dios_framework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  organization_id UUID NOT NULL REFERENCES organization(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Compass App Tables (compass_* prefix)

```sql
CREATE TABLE compass_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  technology VARCHAR(255) NOT NULL,
  assessment JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Current Authentication Flow

### Compass (Session-Based)
1. User submits credentials via login form
2. Backend validates against `user` table
3. Creates session entry in `session` table
4. Returns `xrl_session` cookie
5. Subsequent requests validate cookie against `session` table

### DIOS (JWT-Based)
1. User submits credentials via login form
2. Backend validates against `user` table
3. Creates JWT token signed with secret key
4. Returns token in response
5. Client sends token in `Authorization: Bearer` header

### Portal (Current - Demo Only)
- Uses in-memory state
- No database integration yet
- Login is simulated

---

## Future: Unified Portal Authentication

### Phase 1: Portal SSO (Recommended)

```
User → Portal Login
       ↓
  /api/auth/login (Portal validates user in database)
       ↓
  Issues JWT token
       ↓
  Redirects to Compass or DIOS with token
       ↓
  Apps validate token signature
```

**Implementation:**

```typescript
// app/api/auth/login.ts
import { createClient } from '@vercel/postgres';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const client = createClient();
  await client.connect();

  // Check user exists
  const result = await client.sql`
    SELECT id, password_hash FROM "user"
    WHERE email = ${email}
  `;

  if (!result.rows.length) {
    return new Response('Invalid credentials', { status: 401 });
  }

  // Verify password (use bcrypt in production)
  const user = result.rows[0];
  const match = await verifyPassword(password, user.password_hash);

  if (!match) {
    return new Response('Invalid credentials', { status: 401 });
  }

  // Create JWT token
  const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Compass & DIOS Integration:**

```typescript
// In Compass & DIOS, validate portal JWT
import jwt from 'jsonwebtoken';

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}
```

### Phase 2: Middleware for Protected Routes

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/api/:path*', '/((?!login|_next).*)'],
};
```

---

## Deployment Architecture

### Vercel Deployment
- **Portal:** `analyticarmory.com` (Vercel)
- **Compass:** `compass.analyticarmory.com` (Existing host)
- **DIOS:** `dios.analyticarmory.com` (Existing host)

### DNS Configuration
```
analyticarmory.com       → Vercel nameservers (or CNAME)
compass.analyticarmory.com → CNAME to Compass host
dios.analyticarmory.com    → CNAME to DIOS host
```

### Environment Variables (Vercel)
```
DATABASE_URL=postgresql://user:pass@cloud.sql.goog/armory
JWT_SECRET=your-random-256-bit-secret-here
NEXTAUTH_SECRET=another-secret-for-sessions
```

---

## Security Considerations

### Current (Pre-Auth Integration)
- ✅ HTTPS only (Vercel enforces)
- ✅ Security headers configured (CSP, X-Frame-Options, etc.)
- ✅ XSS protection enabled
- ✅ CORS headers for cross-app requests

### Future (With Database)
- [ ] Password hashing (bcrypt)
- [ ] JWT token rotation
- [ ] Rate limiting on login endpoint
- [ ] CSRF protection
- [ ] Secure session cookies (HttpOnly, SameSite)
- [ ] Audit logging for all auth events
- [ ] Two-factor authentication (2FA)

---

## API Design

### Portal Auth Endpoints

```
POST /api/auth/login
  Request: { email, password }
  Response: { token, user: { id, email, name } }

POST /api/auth/logout
  Response: { success: true }

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: { id, email, name, organization }

POST /api/auth/refresh
  Request: { refreshToken }
  Response: { token }
```

### Cross-App Token Validation

```
GET /api/validate-token
  Headers: Authorization: Bearer <token>
  Response: { valid: true, user: {...} }
```

---

## Data Flow Example

### User logs in to Portal

```
1. User types email/password on portal login page
2. POST /api/auth/login
3. Portal backend queries shared user table
4. Password validated with bcrypt
5. JWT token generated with 24h expiry
6. Token sent to frontend, stored in secure cookie
7. User redirected to /armory (dashboard)
8. Sidebar shows "Session Active"
```

### User clicks "DIOS" app card

```
1. AppCard component detects click
2. Opens https://dios.analyticarmory.com?token=<jwt>
3. DIOS frontend receives token from URL params
4. DIOS validates token signature with shared JWT_SECRET
5. DIOS creates internal session for user
6. User logged into DIOS without re-entering credentials
```

---

## Monitoring & Logging

### Session Table Audit Trail
```sql
SELECT user_id, app, created_at
FROM session
ORDER BY created_at DESC
LIMIT 100;
```

### Failed Login Attempts
```sql
SELECT COUNT(*) FROM failed_login_attempt
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY email;
```

---

## Testing

### Local Testing

```bash
# Test with mock database
export DATABASE_URL="postgresql://localhost/armory_test"
npm run dev

# Test login with demo user
# User: test@example.com
# Password: demo-password-123
```

### Integration Testing

```typescript
// __tests__/api/auth.test.ts
import { POST as login } from '@/app/api/auth/login';

describe('POST /api/auth/login', () => {
  it('should return token for valid credentials', async () => {
    const response = await login(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'correct-password'
        })
      })
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
  });
});
```

---

## References

- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [JWT.io](https://jwt.io)
- [PostgreSQL JSON](https://www.postgresql.org/docs/current/datatype-json.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GCP Cloud SQL](https://cloud.google.com/sql)
