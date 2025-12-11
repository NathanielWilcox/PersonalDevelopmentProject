# Frontend Documentation - PersonalDevelopmentProject

## Overview

React-based frontend for a social platform serving photographers, videographers, actors, and models. Built with modern React patterns, Redux Toolkit for state management, and React Router v7 for navigation.

**Stack**: React 19 + Redux Toolkit + React Router v7 + CSS3

**Port**: 3000 (configurable via `REACT_APP_FRONTEND_PORT` env var)

## Project Structure

``` markdown
primary-app/
├── public/                      # Static assets
├── src/
│   ├── App.js                   # Main routing component
│   ├── App.css                  # Global app styles
│   ├── index.js                 # Entry point
│   ├── index.css                # Global styles
│   ├── Components/              # Reusable UI components
│   │   ├── NavBar.js           # Navigation bar (authenticated routes only)
│   │   ├── NavBar.css
│   │   ├── ProtectedRoute.jsx  # Route wrapper for auth protection
│   │   └── ...
│   ├── Pages/                   # Page components
│   │   ├── Login.jsx           # Auth: login & signup forms
│   │   ├── Home.jsx            # Authenticated home feed
│   │   ├── Map.jsx             # Location discovery
│   │   ├── Profile.jsx         # User profile view/edit
│   │   └── ...
│   ├── store/                   # Redux Toolkit setup
│   │   ├── store.js            # Store configuration & hydration
│   │   ├── authSlice.js        # Auth state (token, user, loading)
│   │   ├── loggedInSlice.js    # Login state tracking
│   │   └── ...
│   ├── utils/                   # Helper functions
│   │   ├── apiClient.js        # Centralized API request helper
│   │   ├── authActions.js      # Login/logout handlers
│   │   ├── authContext.js      # Auth context (alternative to Redux)
│   │   ├── errorHandling.js    # Error utilities
│   │   └── ...
│   ├── config/                  # Configuration files
│   │   └── config.js
│   └── tests/                   # Test files (Jest)
│       ├── Component_Tests/
│       ├── Pages_Tests/
│       └── ...
├── Dockerfile.dev               # Development Docker image
├── package.json                 # Dependencies
└── .env                         # Environment variables
```

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **UI Framework** | React | 19.0.0 | Component library |
| **State Mgmt** | Redux Toolkit | 2.8.2 | Global state management |
| **Routing** | React Router | 7.6.0 | Page navigation & protected routes |
| **HTTP Client** | Fetch API | Native | API communication |
| **Styling** | CSS3 | Native | Responsive design |
| **Cookies** | js-cookie | 3.0.5 | Token persistence |
| **Build Tool** | react-scripts | 5.0.1 | CRA build system |

## Core Concepts

### Authentication Flow

1. **Login Request** → User submits credentials on `/login`
2. **Dispatch Action** → `handleLogin()` dispatches `loginStart()`
3. **API Call** → POST to `{API_BASE_URL}/login` with username/password
4. **Token Response** → Backend returns JWT token + user info
5. **Store in Redux** → Dispatch `loginSuccess(token, user)`
6. **Persist to Storage** → Save token/user to `localStorage` and cookies
7. **Redirect** → Navigate to `/home`
8. **Hydration on Reload** → `store.js` restores auth from localStorage on app startup

### State Management (Redux Toolkit)

**Auth Slice** (`store/authSlice.js`):

```javascript
{
  isLoggedIn: boolean,        // Authentication status
  user: {                     // Current user data
    id, username, email, role
  },
  token: "jwt-token...",      // JWT for API requests
  loading: boolean,           // Login/logout in progress
  error: string               // Error message (if any)
}
```

**Hydration Flow** (`store/store.js`):

- On app startup, restores auth from `localStorage`
- Dispatches `loginSuccess()` if token & user exist
- Dispatches `setHydrationComplete()` when done
- Prevents flash of login page on reload

### Protected Routes

`ProtectedRoute` wrapper component:

```javascript
<Route path="/home" element={
  <ProtectedRoute>
    <Home />
  </ProtectedRoute>
} />
```

Checks `state.auth.isLoggedIn` — redirects to `/login` if false.

### API Communication

**BaseURL Resolution** (`utils/apiClient.js`):

- Reads `REACT_APP_API_BASE_URL` from `.env`
- Fallback: `http://localhost:8800` for local development

**Token Injection** (Frontend responsibility):

```javascript
const token = useSelector(state => state.auth.token);
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

**Error Handling**:

- Uses `handleApiResponse()` utility to parse error status
- Dispatches `loginFailure()` on 401 (token invalid/expired)
- Shows `popupMessage` for user feedback

## Styling Conventions

### Color Scheme

- **Primary Dark**: `#222` (navbar background)
- **Dark Base**: `#000000` (page backgrounds)
- **Light Backgrounds**: `#282c34` (headers)
- **Accent Green**: `#4caf50` (hover states, active links)
- **Light Accent**: `#00a8ff` (secondary highlights)
- **Text**: White on dark, black on light

### CSS Architecture

- **Global Styles**: `index.css` (typography, navbar, link colors)
- **Component Styles**: Co-located CSS files (e.g., `NavBar.css`, `App.css`)
- **Flexbox Layouts**: Used for navbar and responsive containers
- **No CSS-in-JS**: Plain CSS with class-based styling
- **Units**: rem for responsive sizing, px for fixed dimensions

### CSS Classes Reference

| Class | Purpose | File |
|-------|---------|------|
| `.navbar` | Navigation bar container | index.css |
| `.navbar-left` / `.navbar-right` | Nav flex sections | index.css |
| `.nav-link` | Navigation links | index.css |
| `.logout-btn` | Logout button styling | NavBar.css |
| `.active` | Active route highlighting | index.css |
| `.login-page` | Login/signup page | index.css |
| `.tab-buttons` | Form tab switcher | index.css |
| `.login-container` | Login form wrapper | index.css |
| `.popup-message` | Error/success notifications | index.css |

## Development Workflows

### Startup

```bash
# Development (Docker Compose)
docker-compose up -d

# Or standalone:
npm start

# Opens http://localhost:3000 in browser (with hot reload)
```

### Environment Setup

Create `.env` in `primary-app/`:

```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8800
REACT_APP_LOGIN_API_URL=http://localhost:8800/login
REACT_APP_USER_PROFILE_BASE_API_URL=http://localhost:8800/userprofile
REACT_APP_CREATE_PROFILE_API_URL=http://localhost:8800/api/create

# Frontend URLs
REACT_APP_FRONTEND_HOST=http://localhost:3000
REACT_APP_FRONTEND_HOSTNAME=localhost
REACT_APP_FRONTEND_PORT=3000

# Security
REACT_APP_JWT_EXPIRATION=1h

# Feature Flags
REACT_APP_FEATURE_FLAG_NEW_UI=true
```

### Build & Deploy

```bash
# Development build with hot reload
npm start

# Production build
npm run build

# Run tests
npm test

# Eject (one-way operation—not recommended)
npm run eject
```

## Component Patterns

### Functional Components with Hooks

All components use React Hooks:

```javascript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector(state => state.auth);
  
  const [localState, setLocalState] = useState('');
  
  useEffect(() => {
    // Side effects here
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
};
```

### Redux Integration Pattern

```javascript
// Dispatch action
dispatch(loginStart());

// Select state
const isLoading = useSelector(state => state.auth.loading);
const user = useSelector(state => state.auth.user);
const token = useSelector(state => state.auth.token);

// Handle errors
useEffect(() => {
  if (authError) {
    setPopupMessage(authError);
    setTimeout(() => setPopupMessage(''), 3000);
  }
}, [authError]);
```

### Form Handling Pattern

```javascript
const [username, setUsername] = useState('');
const [popupMessage, setPopupMessage] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!username) {
    setPopupMessage('Username required');
    return;
  }
  
  try {
    await dispatch(handleLogin({ username, password }, navigate));
  } catch (error) {
    setPopupMessage(error.message);
  }
};
```

## Key Files Reference

| File | Purpose |
|------|---------|
| [App.js](./src/App.js) | Main routing & layout |
| [store/store.js](./src/store/store.js) | Redux setup, localStorage hydration |
| [store/authSlice.js](./src/store/authSlice.js) | Auth state & reducers |
| [utils/apiClient.js](./src/utils/apiClient.js) | Centralized API requests |
| [utils/authActions.js](./src/utils/authActions.js) | Login/logout handlers |
| [utils/errorHandling.js](./src/utils/errorHandling.js) | API error utilities |
| [Components/ProtectedRoute.jsx](./src/Components/ProtectedRoute.jsx) | Auth protection wrapper |
| [Components/NavBar.js](./src/Components/NavBar.js) | Navigation & logout |
| [Pages/Login.jsx](./src/Pages/Login.jsx) | Login & signup page |
| [Pages/Home.jsx](./src/Pages/Home.jsx) | Home feed (authenticated) |
| [index.css](./src/index.css) | Global styles |

## Testing

Tests are organized in `src/tests/`:

- **Component_Tests/** — Component behavior & rendering
- **Pages_Tests/** — Page-level integration tests

**Run Tests**:

```bash
npm test
```

**Current Status**: Test structure exists; Jest wired via Create React App.

## Known Issues & TODOs

From [App.js](./src/App.js):

- [ ] Secure token storage (use HTTPS + Secure cookies, not localStorage)
- [ ] Add error boundaries for graceful error handling
- [ ] Implement input validation & sanitization
- [ ] Add session expiration handling (refresh token logic)
- [ ] Add loading/error states in all async operations
- [ ] Implement accessibility (a11y) best practices
- [ ] Expand component & integration test coverage
- [ ] Add user feedback for all failed actions
- [ ] Implement logout on token expiration
- [ ] Build main feed (posts, profiles, search, filtering)

## Docker Deployment

**Development Image** (`Dockerfile.dev`):

```dockerfile
FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

**In Docker Compose**:

- Mounts code volume for hot reload
- Connects to backend service via `http://backend:8800`
- Exposes port 3000 to host

## Performance Tips

1. **Code Splitting**: React Router v7 supports lazy loading
2. **Memoization**: Use `React.memo()` for expensive components
3. **Selector Optimization**: Use `useSelector` with specific paths (not entire state)
4. **Bundle Analysis**: `npm run build` creates optimized build
5. **DevTools**: Redux DevTools browser extension for state debugging

## Further Learning

- [React 19 Docs](https://react.dev)
- [Redux Toolkit Docs](https://redux-toolkit.js.org)
- [React Router v7 Docs](https://reactrouter.com)
- [Create React App Docs](https://create-react-app.dev)
