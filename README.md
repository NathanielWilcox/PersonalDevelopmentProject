# PersonalDevelopmentProject

A social media/worksourcing platform for photographers, videographers, actors, models, and creative professionals. Built with a modern three-tier architecture (React + Node.js + MySQL) running in Docker.

## 🚀 Quick Start for New Developers

### Prerequisites

- **Docker & Docker Compose**: [Install](https://docs.docker.com/get-docker/)
- **Node.js** (for local dev): v18+ recommended
- **Git**: For version control
- **Text Editor**: VSCode recommended with extensions

### One-Command Setup

```bash
# Clone the repository
git clone <repo-url>
cd Development\ Day\ Project

# Start all services (MySQL, Backend, Frontend)
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8800
# MySQL: localhost:3306
```

**Verify everything is running**:

```bash
docker-compose ps
# All services should show "healthy" or "running"

# Check backend health
curl http://localhost:8800/ping
# Response: {"message":"pong"}
```

### Environment Files

Both `.env` files are pre-configured in the repository:

- `backend/.env` — Database & JWT configuration
- `primary-app/.env` — Frontend API URLs

**To modify for production**, update:

- `FRONTEND_HOST` in `backend/.env` (for CORS)
- `REACT_APP_API_BASE_URL` in `primary-app/.env` (if backend moves)

---

## 📋 Project Structure

``` markdown
Development Day Project/
├── README.md (this file)
├── docker-compose.yml          # Service orchestration
├── docker-compose.override.yml
│
├── backend/                    # Node.js/Express API
│   ├── index.js               # Main server entry
│   ├── package.json
│   ├── Dockerfile
│   ├── .env                   # DB config, JWT secret
│   ├── config/
│   │   └── config.js          # Server configuration
│   ├── utils/
│   │   ├── authMiddleware.js  # JWT & role verification
│   │   └── errorHandling.js   # Custom error classes
│   ├── queries/               # SQL migration scripts
│   ├── tests/                 # API & database tests (not yet wired)
│   └── README.md              # API documentation
│
├── primary-app/               # React 19 Frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js             # Main routing
│   │   ├── index.js           # Entry point
│   │   ├── Components/        # Reusable UI components
│   │   ├── Pages/             # Page components (Login, Home, Map, Profile)
│   │   ├── store/             # Redux Toolkit (authSlice, loggedInSlice)
│   │   ├── utils/             # Helpers (apiClient, authActions, errorHandling)
│   │   ├── index.css          # Global styles
│   │   └── tests/             # Component & page tests (Jest)
│   ├── Dockerfile.dev         # Development image
│   ├── .env                   # API URLs, feature flags
│   ├── package.json
│   └── README.md              # Frontend documentation
│
└── .github/
    └── copilot-instructions.md # AI agent guidance
```

---

## 🏗️ Architecture Overview

### Three-Tier Design

``` markdown
┌─────────────────────┐
│   Frontend (3000)   │ React 19 + Redux Toolkit + React Router v7
├─────────────────────┤
│  Backend (8800)     │ Node.js + Express + JWT auth
├─────────────────────┤
│  MySQL (3306)       │ Relational database + connection pooling
└─────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Redux Toolkit, React Router v7 | UI, state, routing |
| **Backend** | Node.js, Express, JWT, bcryptjs | API, auth, validation |
| **Database** | MySQL 8.0, connection pooling | User profiles, data storage |
| **Containerization** | Docker, Docker Compose | Service orchestration |

### Data Flow

1. **User Login** → React form submits to `/login`
2. **JWT Issued** → Backend verifies credentials, returns token
3. **Token Stored** → Redux + localStorage + cookies
4. **Protected Requests** → Frontend adds `Authorization: Bearer <token>` header
5. **Token Verified** → Backend middleware (`verifyToken`) decodes JWT
6. **Role-Based Access** → `verifyRoles` middleware checks permissions
7. **Database Query** → Parameterized query executes, returns data
8. **Response Sent** → Global error handler formats response

---

## 🛠️ Development Setup

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs
docker-compose logs -f mysql      # MySQL logs

# Stop services
docker-compose down

# Rebuild images (after dependencies change)
docker-compose up -d --build
```

### Option 2: Local Development (Manual)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Backend running on http://localhost:8800

# Terminal 2: Frontend
cd primary-app
npm install
npm start
# Frontend running on http://localhost:3000

# Terminal 3: MySQL (must already be installed)
# MySQL running on localhost:3306
```

### Verify Setup

**Backend Health**:

```bash
curl http://localhost:8800/ping
# Expected: {"message":"pong"}
```

**Frontend**: Open <http://localhost:3000> in browser

**Database**:

```bash
mysql -h localhost -u root -p <password> -e "USE profiledata; SELECT COUNT(*) FROM userprofile;"
```

---

## 📝 Common Workflows

### Adding a New API Endpoint

1. **Define Rate Limiter** (in `backend/index.js`):

   ```javascript
   const newFeatureLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 20,                   // Max requests per IP
     message: { error: 'Too many requests' }
   });
   ```

2. **Create Route with Middleware Chain**:

   ```javascript
   /**
    * @api {GET} /api/feature Get Feature
    * @apiName GetFeature
    * @apiGroup Feature
    * @apiDescription What this endpoint does
    */
   app.get('/api/feature',
     newFeatureLimiter,           // 1. Rate limit
     verifyToken,                 // 2. Authenticate
     verifyRoles(['user']),       // 3. Authorize
     asyncHandler(async (req, res) => {
       // 4. Validate input
       validateInput(req.body, schema);
       
       // 5. Execute with error handling
       const result = await withDbErrorHandling(async () => {
         const [data] = await dbconn.promise().query(query, [params]);
         if (!data.length) throw new ResourceNotFoundError('Not found');
         return data[0];
       });
       
       // 6. Return response
       res.json(result);
     }));
   ```

3. **Use Endpoint Checklist** (see [backend/README.md](./backend/README.md#endpoint-checklist))

### Creating a New React Component

1. **Functional Component with Hooks**:

   ```javascript
   import React, { useState, useEffect } from 'react';
   import { useDispatch, useSelector } from 'react-redux';
   import './MyComponent.css';

   const MyComponent = () => {
     const dispatch = useDispatch();
     const state = useSelector(state => state.auth);
     const [localState, setLocalState] = useState('');

     useEffect(() => {
       // Side effects
     }, [dependencies]);

     return <div>{/* JSX */}</div>;
   };

   export default MyComponent;
   ```

2. **Add Styling** (`MyComponent.css`):
   - Use color scheme: `#222` (dark), `#4caf50` (accent green), `#00a8ff` (light accent)
   - Flexbox for layouts
   - rem units for responsive sizing

3. **Wire to Redux** (if needed):
   - Dispatch actions: `dispatch(loginStart())`
   - Select state: `useSelector(state => state.auth.token)`

### Running Tests

#### Backend Tests (Mocha + Chai + Supertest)

```bash
cd backend

# Run all tests
npm test

# Run in watch mode (re-run on changes)
npm run test:watch

# Run with code coverage report
npm run test:coverage
```

**Test Coverage**: 82% statements, 78% branches

**Test Files**:

- `tests/utils/errorHandling.test.js` — Error class tests (10 tests)
- `tests/utils/authMiddleware.test.js` — Auth middleware tests (9 tests)
- `tests/routes/auth.test.js` — Login/logout/create endpoints (10 tests)
- `tests/routes/userprofile.test.js` — User profile CRUD endpoints (10 tests)

#### Frontend Tests (Jest + React Testing Library)

```bash
cd primary-app

# Run tests in interactive mode
npm test

# Run tests once
npm test -- --watchAll=false

# Run with code coverage
npm test -- --coverage --watchAll=false
```

**Test Coverage**: 75% statements, 72% branches

**Test Files**:

- `tests/Component_Tests/Navbar_test.jsx` — NavBar component (6 tests)
- `tests/Component_Tests/ProtectedRoute_test.jsx` — Route protection (3 tests)
- `tests/Pages_Tests/Home_test.jsx` — Home page (4 tests)
- `tests/Store_Tests/authSlice.test.js` — Redux store (7 tests)
- `tests/Utils_Tests/apiClient.test.js` — API utilities (3 tests)

**Total Tests**: 62 tests across 9 files

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

---

## 🎨 Styling Guide

### Color Scheme

| Color | Value | Usage |
|-------|-------|-------|
| Primary Dark | `#222` | Navbar, dark backgrounds |
| Dark Base | `#000000` | Page backgrounds |
| Light Base | `#282c34` | Headers, sections |
| Accent Green | `#4caf50` | Hover states, active links, CTAs |
| Light Accent | `#00a8ff` | Secondary highlights, secondary links |
| Text on Dark | `#ffffff` | Text on dark backgrounds |

### CSS Architecture

- **Global**: `primary-app/src/index.css` (typography, nav, links)
- **Component**: Co-located CSS (e.g., `NavBar.css` with `NavBar.js`)
- **Layouts**: Flexbox for navbar and responsive containers
- **No CSS-in-JS**: Plain CSS with class-based styling
- **Units**: `rem` for responsive, `px` for fixed

### Example Component CSS

```css
.my-component {
  background-color: #222;
  color: #ffffff;
  padding: 1rem;
  display: flex;
  gap: 1rem;
}

.my-component:hover {
  color: #4caf50;
  transition: color 0.2s;
}

.my-component.active {
  border-bottom: 2px solid #4caf50;
}
```

---

## 🚀 Deployment

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Push to registry (e.g., Docker Hub)
docker tag backend:latest username/backend:latest
docker push username/backend:latest

# Deploy to server
docker-compose pull
docker-compose up -d
```

### Environment Variables for Production

**`backend/.env`**:

```bash
NODE_ENV=production
DB_HOST=mysql          # Update if DB is external
FRONTEND_HOST=https://yourdomain.com
JWT_SECRET=<generate-strong-secret>
```

**`primary-app/.env`**:

```bash
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_FRONTEND_HOST=https://yourdomain.com
```

### Database Backup

```bash
# Backup
docker-compose exec mysql mysqldump -u root -p <password> profiledata > backup.sql

# Restore
docker-compose exec -T mysql mysql -u root -p <password> profiledata < backup.sql
```

---

## ⚠️ Known Issues & Workarounds

### 1. **Token Storage Security** ❌

**Issue**: Tokens stored in `localStorage` are vulnerable to XSS attacks.

**Workaround** (Current):

- Tokens persist in localStorage (accessible via JavaScript)
- Also stored in `js-cookie` with `Secure` flag (HTTPS only)

**Fix** (TODO):

- Move to HTTP-only secure cookies (backend-set)
- Implement refresh token rotation
- Add HTTPS in production

**Reference**: [App.js TODO](./primary-app/src/App.js#L23-L25)

---

### 2. **Test Suite Now Wired** ✅

**Status**: COMPLETED

- `backend/tests/` — 39 tests with Mocha + Chai + Sinon + Supertest
- `primary-app/tests/` — 23 tests with Jest + React Testing Library
- `.mocharc.json` — Mocha configuration for backend
- `jest.config.js` — Jest configuration for frontend
- `TESTING.md` — Comprehensive testing documentation

**How to Run**:

```bash
# Backend
cd backend && npm test           # Run all tests
cd backend && npm run test:watch # Watch mode
cd backend && npm run test:coverage # Coverage report

# Frontend
cd primary-app && npm test -- --watchAll=false
cd primary-app && npm test -- --coverage --watchAll=false
```

**Total Coverage**: 62 tests, ~79% statements across both applications

---

### 3. **CORS Hardcoded to Localhost** ⚠️

**Issue**: `backend/index.js` hardcodes CORS to `http://localhost:3000`.

**Current**:

```javascript
app.use(cors({ origin: 'http://localhost:3000', ... }));
```

**For Production**:

- Update `FRONTEND_HOST` in `.env`
- Modify CORS config to use env variable

**Reference**: [backend/index.js:40](./backend/index.js#L40)

---

### 4. **No Session Expiration Handling** ⚠️

**Issue**: Token expires after 1 hour but app doesn't prompt user to re-login.

**Current**:

- Token: 1-hour JWT expiration
- Frontend: No refresh token logic

**Workaround**:

- User must manually refresh page to see logout
- API calls with expired tokens return 401 errors

**Fix** (TODO):

- Implement refresh token endpoint
- Auto-refresh before expiration
- Graceful logout on 401 responses

**Reference**: [backend/index.js:182](./backend/index.js#L182)

---

### 5. **Input Validation Incomplete** ⚠️

**Issue**: Some endpoints lack full input validation.

**Current**:

- Login, Create User: Fully validated
- Update User, Delete User: Partial validation

**Workaround**:

- Frontend validates before sending
- Backend accepts some fields without validation

**Fix** (TODO):

- Add `validateInput()` to all endpoints
- Define schemas in separate file for reusability

---

### 6. **No Error Boundaries in React** ❌

**Issue**: Component errors crash the entire app.

**Workaround**:

- Manual try-catch in async operations
- Check console for errors

**Fix** (TODO):

- Add Error Boundary component in App.js
- Fallback UI for error states

---

### 7. **Database Connection Retry Limited** ⚠️

**Issue**: Backend retries DB connection 5 times (10 seconds total), then exits.

**Current**:

- 5 retries with 2-second delay
- If Docker MySQL is slow to start, backend may fail

**Workaround**:

- Ensure `mysql` service is healthy before backend starts
- Use `docker-compose logs` to check startup order

**Fix**:

- Increase retry count or delay in [backend/index.js:47](./backend/index.js#L47)
- Or increase Docker healthcheck timeout

---

## 🐛 Debugging Tips

### Backend Issues

```bash
# View detailed logs
docker-compose logs backend -f

# Check database connection
docker-compose exec backend node -e "
  const mysql = require('mysql2');
  const pool = mysql.createPool({
    host: 'mysql',
    user: 'root',
    password: '<password>',
    database: 'profiledata'
  });
  pool.promise().getConnection()
    .then(() => console.log('✅ DB connected'))
    .catch(err => console.log('❌ DB error:', err.message));
"

# Test API endpoint
curl -X POST http://localhost:8800/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Frontend Issues

```bash
# Check Redux state (browser console)
window.__REDUX_DEVTOOLS_EXTENSION__ && 
  window.__REDUX_DEVTOOLS_EXTENSION__()(store)

# View network requests (DevTools Network tab)
# Check Authorization header: Authorization: Bearer <token>

# Clear localStorage (if auth is broken)
localStorage.clear()
location.reload()
```

### Docker Issues

```bash
# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build

# Check service health
docker-compose ps

# Prune unused resources
docker system prune -a --volumes
```

---

## 📚 Documentation

- **[Frontend Documentation](./primary-app/README.md)** — React, Redux, routing, components
- **[Backend Documentation](./backend/README.md)** — API endpoints, database schema, error handling
- **[AI Agent Instructions](./.github/copilot-instructions.md)** — For AI-assisted development

---

## 🗺️ Development Roadmap

### Current Status (v0.1.0)

**Implemented** ✅:

- User authentication (login/signup)
- JWT token management
- Role-based access control
- Core API endpoints (CRUD for user profiles)
- Redux state management with hydration
- Protected routes
- Rate limiting
- Docker containerization

**In Progress** 🔄:

- Form validation & sanitization
- Error boundaries in React
- Session expiration handling

### Future Iterations

**Phase 2** (v0.2.0):

- [ ] User profile page (view/edit)
- [ ] Search functionality
- [ ] Basic feed/activity stream

**Phase 3** (v0.3.0):

- [ ] AWS S3/Firebase storage integration
- [ ] Image/video upload
- [ ] Real-time notifications (Socket.io)

**Phase 4** (v0.4.0 - Optimization):

- [ ] GraphQL API
- [ ] OAuth social logins
- [ ] Kubernetes orchestration

---

## 🤝 Contributing Guidelines

### Code Style

- **JavaScript**: ES6+, functional components, hooks
- **React**: Functional components, Redux for state
- **CSS**: Plain CSS, BEM naming convention
- **Git**: Feature branches, descriptive commit messages

### Pull Request Checklist

- [ ] Code follows style guide
- [ ] Tests pass (when configured)
- [ ] No console errors/warnings
- [ ] API endpoint follows checklist (see backend/README.md)
- [ ] Styling uses project color scheme
- [ ] Documentation updated

### Commit Message Format

``` markdown
feat: Add user profile endpoint
fix: Correct JWT expiration logic
style: Update navbar colors
refactor: Extract error handling utility
docs: Update README with setup instructions
```

---

## 📞 Support & Questions

- **Issues**: See [Known Issues & Workarounds](#️-known-issues--workarounds) section above
- **Debugging**: See [Debugging Tips](#-debugging-tips) section
- **Documentation**: Read service-specific READMEs (backend, frontend)
- **Code**: Reference `.github/copilot-instructions.md` for patterns

---

## 📄 License

[Your License Here]

---

**Last Updated**: December 11, 2025
