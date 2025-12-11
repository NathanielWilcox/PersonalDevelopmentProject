# Copilot Instructions - PersonalDevelopmentProject

## Architecture Overview

This is a **MERN-style social platform** (MongoDB/MySQL + Express + React + Node.js) for photographers, videographers, actors, and models. Three-tier architecture:

- **Frontend**: React 19 with Redux Toolkit + React Router v7 (port 3000)
- **Backend**: Node.js/Express with JWT auth + bcrypt (port 8800)
- **Database**: MySQL 8.0 with connection pooling (port 3306)
- **Containerization**: Docker Compose with health checks and volume mounts

All services communicate via Docker service names in containers (`backend` service) or localhost in dev.

## Key Architectural Patterns

### 1. Authentication & Authorization
- **JWT-based**: Tokens issued on login, verified on protected routes
- **Middleware chain**: `verifyToken` → `verifyRoles` (see [backend/utils/authMiddleware.js](../backend/utils/authMiddleware.js))
- **Password security**: bcryptjs with salt rounds 10
- **Token storage (frontend)**: localStorage (not secure by default—needs HTTPS + Secure cookies per App.js TODO)
- **Role system**: ENUM in DB (user, photographer, videographer, musician, artist, admin)

### 2. State Management (Frontend)
- **Redux Toolkit slices**: `authSlice` (token, user, isLoggedIn) and `loggedInSlice`
- **Hydration on app load**: [store/store.js](../primary-app/src/store/store.js) restores auth from localStorage before rendering
- **Protected routes**: `ProtectedRoute` wrapper component in [Components/ProtectedRoute.jsx](../primary-app/src/Components/ProtectedRoute.jsx)

### 3. Error Handling (Backend)
Custom error classes in [backend/utils/errorHandling.js](../backend/utils/errorHandling.js):
- `ValidationError` (400), `AuthenticationError` (401), `AuthorizationError` (403)
- `DatabaseError` (500), `ResourceNotFoundError` (404), `ConflictError` (409)
- Error responses are handled by global middleware; prefer throwing errors over manual res.status()

### 4. Rate Limiting
Middleware in [backend/index.js](../backend/index.js) protects endpoints:
- Account creation: 10 requests/15 min per IP
- User profile GET: 100 requests/15 min per IP
- Login: 10 attempts/15 min per IP

Always apply limiters to sensitive endpoints.

### 5. Database Design
MySQL table: `userprofile` with compound indexes:
- **Primary key**: `idusers` (auto-increment)
- **Unique indexes**: `idx_username` (login), `idx_email` (duplicate checks)
- **Compound index**: `idx_role_created` (role + timestamp) for filtering users
- **Constraints**: Username ≥3 chars, alphanumeric+underscore, email validation
- See [backend/README.md](../backend/README.md) for full schema

## Development Workflows

### Startup
```bash
# Development (Docker Compose)
docker-compose up -d

# Or standalone:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd primary-app && npm start

# Terminal 3 - MySQL (external)
# MySQL running on localhost:3306
```

### Environment Setup
- **Backend**: [backend/.env](../backend/.env) — DB_HOST, DB_USER, DB_NAME, JWT_SECRET, etc.
- **Frontend**: [primary-app/.env](../primary-app/.env) — REACT_APP_API_BASE_URL (http://localhost:8800)
- **Docker**: env_file references auto-load in docker-compose.yml

### Testing
- **Backend**: `npm test` (not yet configured; use sql_tests/ and backend_tests/ folders)
- **Frontend**: `npm test` (Jest via Create React App)
- See [backend/tests/](../backend/tests/) and [primary-app/tests/](../primary-app/tests/) structure

### Building
- **Backend**: Dockerfile uses Node.js, installs deps, runs index.js
- **Frontend**: Dockerfile.dev uses node:latest for dev mode; production: `npm run build`
- **Docker Compose volumes**: Enables hot reload for development code changes

## Styling Conventions

### Color Scheme & Design System
- **Primary dark theme**: `#222` (navbar, dark backgrounds)
- **Accent color**: `#4caf50` (hover states, active links)
- **Light accent**: `#00a8ff` (secondary highlights)
- **Dark base**: `#000000` or `#282c34` (backgrounds)
- **Text color**: White on dark, black on light

### CSS Patterns
- **Global styles**: [primary-app/src/index.css](../primary-app/src/index.css) — base typography, nav, link colors
- **Component styles**: Co-located CSS files (e.g., [NavBar.css](../primary-app/src/Components/NavBar.css))
- **Flexbox layouts**: Used for navbar and responsive containers
- **No CSS-in-JS framework** — plain CSS with class-based styling
- **Animation**: See App-logo-spin in [App.css](../primary-app/src/App.css) for animation patterns
- **Form styling**: Login form uses tab buttons and input fields with consistent spacing

### Responsive Design
- Media queries follow standard breakpoints
- Flexbox for alignment (`display: flex`, `align-items: center`, `justify-content: space-between`)
- Padding/margin: Use rem units (e.g., `1rem`, `0.75rem`)

## API Creation Guide

### Backend API Endpoint Structure
Every new endpoint should follow this pattern from [backend/index.js](../backend/index.js):

```javascript
/**
 * @api {METHOD} /api/route Route Description
 * @apiName EndpointName
 * @apiGroup ResourceName
 * @apiDescription What the endpoint does
 */
app.METHOD('/api/route',
  rateLimiter,           // Apply rate limiting for sensitive endpoints
  verifyToken,           // Require authentication (optional)
  verifyRoles(['role']), // Enforce role-based access (optional)
  asyncHandler(async (req, res) => {
    const result = await withDbErrorHandling(async () => {
      // Database operation here
      // Throw custom errors on failure
      if (!found) throw new ResourceNotFoundError('...');
      return data;
    });
    res.json(result); // or res.status(201).json(result)
  }));
```

### API Response Format
- **Success (200)**: `res.json(data)` or `res.status(201).json({ message: '...', data })`
- **Errors**: Automatically formatted by global `errorHandler` middleware
- **Error response format**:
  ```json
  {
    "error": {
      "message": "Human-readable message",
      "code": "ErrorClassName",
      "fields": { "fieldName": "Field error message" }
    }
  }
  ```

### Input Validation Pattern
Use `validateInput(req.body, schema)` from [backend/utils/errorHandling.js](../backend/utils/errorHandling.js):

```javascript
const schema = {
  fieldName: {
    required: true,
    pattern: /^[a-z0-9]{3,30}$/,
    minLength: 3,
    maxLength: 100,
    enum: ['value1', 'value2'],
    message: 'Custom error message'
  }
};
validateInput(req.body, schema); // Throws ValidationError with field details if invalid
```

### Database Query Patterns
- Always use **parameterized queries** to prevent SQL injection:
  ```javascript
  const [data] = await dbconn.promise().query(
    'SELECT * FROM table WHERE id = ?',
    [userId]
  );
  ```
- Wrap database operations in `withDbErrorHandling()` to catch and convert errors
- Return specific fields, not `SELECT *`
- Use connection pool (already configured in [backend/index.js](../backend/index.js))

### Frontend API Communication
- Use `apiRequest()` helper from [primary-app/src/utils/apiClient.js](../primary-app/src/utils/apiClient.js)
- Token is NOT auto-injected in `apiRequest()` — manually add header or create wrapper:
  ```javascript
  const token = useSelector(state => state.auth.token);
  const response = await fetch(`${getApiBaseUrl()}/endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  ```
- Use `handleApiResponse()` to parse and validate responses
- Dispatch Redux actions (`loginStart`, `loginSuccess`, `loginFailure`) to update state
- Store sensitive data: tokens in localStorage, user info in Redux

### Rate Limiting Configuration
Add a new limiter in [backend/index.js](../backend/index.js) before defining routes:

```javascript
const newEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // Max requests per IP
  message: { error: 'Too many requests...' }
});
```

Then apply to route: `app.get('/api/endpoint', newEndpointLimiter, verifyToken, ...)`

### Common Endpoint Checklist
When adding a new API endpoint:
- [ ] Add JSDoc comments with @api, @apiName, @apiGroup, @apiDescription
- [ ] Apply appropriate rate limiter for sensitive operations
- [ ] Add `verifyToken` middleware if authentication required
- [ ] Add `verifyRoles(['role'])` if role-based access needed
- [ ] Wrap handler in `asyncHandler()` to catch promise rejections
- [ ] Use `validateInput()` for request body validation
- [ ] Throw custom errors (don't use `res.status()` manually)
- [ ] Return specific JSON structure (no raw errors to client)
- [ ] Use parameterized queries for database operations

## Project-Specific Conventions

### API Communication
- **Fetch wrapper**: [primary-app/src/utils/apiClient.js](../primary-app/src/utils/apiClient.js) — centralizes baseUrl, headers, token injection
- **Token injection**: Should include `Authorization: Bearer <token>` header (frontend responsibility)
- **CORS**: Hardcoded to `http://localhost:3000` in [backend/index.js](../backend/index.js)—update for production

### Component Structure
- **Stateless components**: Functional components with Redux hooks
- **Protected routes**: Wrap in `ProtectedRoute` to enforce authentication
- **Page components**: [primary-app/src/Pages/](../primary-app/src/Pages/) (Home, Login, Map, Profile)
- **Reusable components**: [primary-app/src/Components/](../primary-app/src/Components/) (NavBar, ProtectedRoute)

### Naming & Code Style
- **Redux actions**: camelCase (e.g., `loginSuccess`, `updateProfile`)
- **Express routes**: RESTful HTTP verbs (GET, POST, PUT, DELETE)
- **Error handling**: Throw custom errors; let middleware catch and respond
- **Database queries**: Parameterized queries to prevent SQL injection

## Cross-Component Communication

**Frontend flow:**
1. User action → dispatch Redux action (e.g., loginStart)
2. Redux thunk or async action calls apiRequest()
3. apiClient adds Authorization header with token from store
4. Response updates Redux state (loginSuccess or loginFailure)
5. Component re-renders from store state

**Backend flow:**
1. HTTP request arrives with Bearer token
2. verifyToken middleware decodes JWT, attaches user to req.user
3. (Optional) verifyRoles middleware checks req.user.role
4. Route handler queries database, throws custom errors if needed
5. Global error handler catches and sends JSON response with statusCode

## Critical Files to Review First
- [backend/index.js](../backend/index.js) — Entry point, routes, middleware order
- [primary-app/src/App.js](../primary-app/src/App.js) — Route structure, protection logic
- [backend/utils/authMiddleware.js](../backend/utils/authMiddleware.js) — Auth/role verification
- [primary-app/src/store/store.js](../primary-app/src/store/store.js) — Redux setup + hydration
- [docker-compose.yml](../docker-compose.yml) — Service orchestration, port mappings, health checks

## Open TODOs & Known Gaps
- Frontend token storage needs HTTPS + secure cookies (see App.js)
- Error boundaries missing in React components
- Input validation/sanitization incomplete
- Logging & monitoring not implemented
- Session expiration handling incomplete
- Tests not wired up (folders exist, tests not running)
- GraphQL & AWS S3/Firebase Storage: future iterations

