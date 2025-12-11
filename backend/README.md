# Backend API Documentation

## Overview

Node.js/Express backend for a social platform serving photographers, videographers, actors, and models. Implements JWT-based authentication, role-based access control, input validation, rate limiting, and custom error handling.

**Stack**: Node.js + Express + MySQL 8.0 + JWT + bcryptjs

**Port**: 8800 (configurable via `BACKEND_PORT` env var)

## Architecture

### Core Components

- **Authentication**: JWT tokens with 1-hour expiration, verified via `verifyToken` middleware
- **Authorization**: Role-based access control via `verifyRoles` middleware
- **Error Handling**: Custom error classes with automatic HTTP status code mapping
- **Input Validation**: Schema-based validation with detailed field-level error reporting
- **Rate Limiting**: Per-endpoint protection against abuse
- **Database**: Connection pooling with retry logic

## Database Schema

### User Profile Table

The `userprofile` table is optimized for both performance and data integrity.

#### Table Structure

| Column   | Type                                                     | Constraints                    | Description                    |
|----------|----------------------------------------------------------|--------------------------------|--------------------------------|
| idusers  | INT                                                      | PRIMARY KEY, AUTO_INCREMENT    | Unique identifier              |
| username | VARCHAR(45)                                              | NOT NULL, UNIQUE, LENGTH >= 3  | User's login name (3-30 chars alphanumeric+underscore) |
| password | VARCHAR(255)                                             | NOT NULL                       | Bcrypt hashed password (salt rounds: 10) |
| email    | VARCHAR(100)                                             | UNIQUE, REGEX validation       | User's email address           |
| role     | ENUM('user','photographer','videographer','musician','artist','admin') | DEFAULT 'user'                 | User's system role             |
| created  | TIMESTAMP                                                | DEFAULT CURRENT_TIMESTAMP      | Account creation time          |

#### Indexes

1. **Primary Key**: `idusers`
   - Automatically indexed
   - Used for unique identification and relations

2. **Username Index**: `idx_username`
   - Type: UNIQUE
   - Used for: Login queries, username lookups
   - Benefits: Fast authentication checks

3. **Email Index**: `idx_email`
   - Type: NORMAL
   - Used for: Email searches
   - Benefits: Quick duplicate email checks

4. **Role-Created Index**: `idx_role_created`
   - Type: COMPOUND
   - Columns: (role, created)
   - Used for: Role-based queries with time filtering
   - Benefits: Efficient user listing by role and signup date

#### Constraints & Validation

1. **Username**
   - Length: 3-30 characters
   - Pattern: `^[a-zA-Z0-9_]{3,30}$` (alphanumeric + underscore)
   - Index: `idx_username` (UNIQUE)
   - Used for login queries and duplicate checks

2. **Password**
   - Hashing: bcryptjs with 10 salt rounds
   - Development: minimum 2 characters (for testing)
   - Production: minimum 6 characters
   - Never stored or returned in plain text

3. **Email**
   - Format: RFC-compliant email pattern
   - Optional field (can be NULL)
   - Index: `idx_email` (NORMAL)
   - Validated on account creation and updates

4. **Role**
   - Enum values: `'user'`, `'photographer'`, `'videographer'`, `'musician'`, `'artist'`, `'admin'`
   - Default: `'user'`
   - Used for authorization in protected routes

## API Endpoints

### Authentication Endpoints

#### POST /login

Authenticate user and receive JWT token.

**Rate Limit**: 10 requests per 15 minutes per IP

**Request Body**:

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200)**:

```json
{
  "id": 1,
  "username": "username",
  "email": "user@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses**:

- `400`: Validation failed (missing fields)
- `401`: Invalid username or password
- `500`: Database error

**Notes**: Token expires in 1 hour. Must include `Authorization: Bearer <token>` in headers for protected routes.

---

#### POST /api/logout

Logout current user. Invalidates session on client-side.

**Authentication**: Required (Bearer token)

**Success Response (200)**:

```json
{
  "message": "Successfully logged out"
}
```

---

### User Profile Endpoints

#### POST /api/create

Create a new user profile and account.

**Rate Limit**: 10 requests per 15 minutes per IP

**Request Body**:

```json
{
  "username": "string (required, 3-30 chars, alphanumeric+underscore)",
  "password": "string (required, min 2 in dev, min 6 in prod)",
  "email": "string (optional, valid email format)",
  "role": "string (optional, enum: user|photographer|videographer|musician|artist|admin, default: user)"
}
```

**Success Response (201)**:

```json
{
  "message": "User profile created successfully!",
  "userId": 1
}
```

**Error Responses**:

- `400`: Validation failed (see `fields` object for details)
- `409`: Username or email already exists
- `500`: Database error

---

#### GET /api/userprofile

Retrieve the authenticated user's profile.

**Authentication**: Required (Bearer token)

**Rate Limit**: 100 requests per 15 minutes per IP

**Authorization**: All roles allowed

**Success Response (200)**:

```json
{
  "idusers": 1,
  "username": "username",
  "email": "user@example.com",
  "role": "user",
  "created": "2024-12-11T10:30:00Z"
}
```

**Error Responses**:

- `401`: Invalid or missing token
- `404`: User profile not found
- `500`: Database error

---

#### PUT /userprofile/:id

Update a user profile (self or admin only).

**Authentication**: Required (Bearer token)

**Authorization**: User can modify own profile; admins can modify any profile

**Request Body** (all fields optional):

```json
{
  "username": "string (3-30 chars, alphanumeric+underscore)",
  "email": "string (valid email format)",
  "role": "string (enum: user|photographer|videographer|musician|artist|admin)"
}
```

**Success Response (200)**:

```json
{
  "message": "User profile updated successfully!"
}
```

**Error Responses**:

- `400`: Validation failed
- `401`: Invalid or missing token
- `403`: Not authorized to modify this profile
- `404`: User not found
- `409`: Username already in use
- `500`: Database error

---

#### DELETE /userprofile/:id

Delete a user profile (admin only).

**Authentication**: Required (Bearer token)

**Authorization**: Admin role required

**Success Response (200)**:

```json
{
  "message": "User profile deleted successfully!"
}
```

**Error Responses**:

- `401`: Invalid or missing token
- `403`: Admin access required; cannot delete own account
- `404`: User not found
- `500`: Database error

### Rate Limiting Summary

All endpoints are protected by request rate limiting:

| Endpoint              | Time Window | Max Requests | Error Code |
|----------------------|-------------|--------------|------------|
| POST /login          | 15 minutes  | 10          | 429        |
| POST /api/create     | 15 minutes  | 10          | 429        |
| GET /api/userprofile | 15 minutes  | 100         | 429        |

## Error Handling

### Custom Error Classes

All errors are handled via custom error classes in `utils/errorHandling.js`:

| Error Class | HTTP Status | Usage |
|-------------|-------------|-------|
| `ValidationError` | 400 | Input validation failures with field-level details |
| `AuthenticationError` | 401 | Invalid credentials, missing token, token expired |
| `AuthorizationError` | 403 | Insufficient permissions for requested resource |
| `ResourceNotFoundError` | 404 | Resource (user, profile) not found in database |
| `ConflictError` | 409 | Duplicate username/email or constraint violation |
| `DatabaseError` | 500 | Database operation failures |

### Error Response Format

All error responses follow this standard format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ErrorClassName",
    "fields": {
      "fieldName": "Field-specific error message"
    }
  }
}
```

Example validation error:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "ValidationError",
    "fields": {
      "username": "Username must be 3-30 characters long and contain only letters, numbers, and underscores",
      "password": "Password must be at least 6 characters long"
    }
  }
}
```

### Error Handling Patterns

- **Custom errors are thrown** in route handlers and database operations
- **Global middleware catches all errors** and formats responses automatically
- **No manual `res.status()` calls** — use custom error classes
- **Database errors are wrapped** via `withDbErrorHandling()` to map MySQL errors to custom classes

---

## Security Measures

### Password Handling

- Hashing: bcryptjs with 10 salt rounds
- Never stored or returned in plain text
- Compared securely using `bcrypt.compare()`

### Authentication & Authorization

- **JWT tokens**: Signed with `JWT_SECRET` env var, 1-hour expiration
- **Middleware chain**: All protected routes use `verifyToken` → optional `verifyRoles`
- **Token extraction**: From `Authorization: Bearer <token>` header
- **Role-based access**: `verifyRoles(['admin'])` enforces role requirements

### Input Validation

- **Schema-based validation** with `validateInput(data, schema)`
- **Regex patterns** for username, email, password formats
- **Field constraints**: min/max length, enum values, required fields
- **Field-level error reporting** in response

### SQL Injection Prevention

- **Parameterized queries** exclusively (placeholders: `?`)
- All user input passed as separate parameters to query builders
- Connection pooling with secure configuration

### CORS & Rate Limiting

- **CORS origin**: Hardcoded to `http://localhost:3000` (update for production)
- **Rate limiters**: Applied per endpoint to prevent brute-force and abuse
- **Per-IP tracking**: Rate limits are per IP address

## Middleware & Request Handling

### Middleware Chain

All Express routes follow this standard middleware order:

1. **Rate Limiter** (optional) — limits requests per IP
2. **verifyToken** (optional) — validates JWT from Authorization header
3. **verifyRoles** (optional) — checks user role against allowed roles
4. **asyncHandler** — wraps async handler to catch promise rejections
5. **Route Handler** — executes business logic

### Built-in Utilities

#### asyncHandler

Wraps async route handlers to automatically catch promise rejections and pass to error middleware:

```javascript
app.get('/api/endpoint', asyncHandler(async (req, res) => {
  // If any promise rejects, error is caught automatically
  const data = await someAsyncOperation();
  res.json(data);
}));
```

#### withDbErrorHandling

Wraps database operations to catch MySQL errors and map to custom error classes:

```javascript
const result = await withDbErrorHandling(async () => {
  const [data] = await dbconn.promise().query(query, params);
  if (!data.length) throw new ResourceNotFoundError('Not found');
  return data[0];
});
```

#### validateInput

Validates request body against schema and throws `ValidationError` with field details:

```javascript
const schema = {
  username: { required: true, pattern: /^[a-z0-9_]{3,30}$/, message: 'Invalid username' },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
};
validateInput(req.body, schema);
```

---

## Performance & Optimization

### Query Optimization

1. **Column Selection**
   - Specific columns only (no `SELECT *`)
   - Reduces data transfer and memory usage
   - Example: `SELECT idusers, username, email, role FROM userprofile WHERE idusers = ?`

2. **Index Strategy**
   - `idx_username` (UNIQUE): Fast login queries
   - `idx_email` (NORMAL): Quick duplicate email checks
   - `idx_role_created` (COMPOUND): Efficient role-based filtering with timestamps

3. **Parameterized Queries**
   - All values passed as parameters (prevents SQL injection)
   - Query plans cached by database engine
   - Example: `SELECT * FROM table WHERE id = ?` with separate `[userId]` parameter

### Database Connection

1. **Connection Pooling**
   - Pool size: 10 connections (configurable via `DB_POOL_*` env vars)
   - Queue limit: 0 (unlimited queue)
   - Automatic connection recycling and health checks

2. **Retry Logic**
   - Database connects with 5 retries on startup
   - 2-second delay between retry attempts
   - Graceful shutdown if all retries fail

3. **Health Checks**
   - Docker healthcheck verifies MySQL availability
   - Backend depends on healthy MySQL service
   - Automatic restart on connection loss

## Development Guidelines

### Creating New API Endpoints

Follow this pattern for consistency:

```javascript
// 1. Define rate limiter (if needed)
const newFeatureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests' }
});

// 2. Add JSDoc comments
/**
 * @api {METHOD} /api/route Route Description
 * @apiName EndpointName
 * @apiGroup ResourceName
 * @apiDescription What the endpoint does
 */

// 3. Define route with middleware chain
app.METHOD('/api/route',
  newFeatureLimiter,           // 1. Rate limit
  verifyToken,                 // 2. Authenticate (optional)
  verifyRoles(['role']),       // 3. Authorize (optional)
  asyncHandler(async (req, res) => {
    // 4. Validate input
    validateInput(req.body, schema);
    
    // 5. Execute with error handling
    const result = await withDbErrorHandling(async () => {
      const [data] = await dbconn.promise().query(query, params);
      if (!data.length) throw new ResourceNotFoundError('...');
      return data[0];
    });
    
    // 6. Return formatted response
    res.json(result); // or res.status(201).json(result)
  }));
```

### Endpoint Checklist

When adding a new endpoint:

- [ ] Add JSDoc comments (@api, @apiName, @apiGroup, @apiDescription)
- [ ] Apply appropriate rate limiter for sensitive operations
- [ ] Add `verifyToken` if authentication required
- [ ] Add `verifyRoles(['role'])` if role-based access needed
- [ ] Wrap handler in `asyncHandler()` to catch promise rejections
- [ ] Use `validateInput()` for request body validation with detailed schema
- [ ] Throw custom errors (`ValidationError`, `AuthenticationError`, etc.)
- [ ] Return specific fields only, never raw errors to client
- [ ] Use parameterized queries exclusively
- [ ] Test all error paths (validation, auth, not found, conflicts, etc.)

### Database Changes

When modifying the schema:

1. Create migration script in `backend/queries/`
2. Document column constraints, indexes, and validation rules
3. Update this README.md with schema changes
4. Test constraints and index performance
5. Verify backward compatibility if upgrading existing databases

### Testing

Tests are organized in `backend/tests/`:

- `sql_tests/` — Database queries and constraint validation
- `backend_tests/` — API endpoint behavior and error handling

**Current Status**: Test structure exists but suite not yet wired to npm test command.

**To run tests** (when configured):

```bash
npm test
```

### Environment Variables

All configuration via `.env` file:

```bash
# Database
DB_HOST=localhost
DB_PORT=<yourport>
DB_USER=root
DB_NAME=profiledata
DB_CONNECTION_PASSWORD=<password>

# Server
BACKEND_PORT=8800
FRONTEND_HOST=http://localhost:3000

# Security
JWT_SECRET=<your-secret-here>
JWT_EXPIRATION=1h

# Runtime
NODE_ENV=development
```

Update `FRONTEND_HOST` for production deployments to enable CORS for your domain.
  