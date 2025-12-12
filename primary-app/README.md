# Frontend Documentation - PersonalDevelopmentProject

## Overview

React-based frontend for a social platform serving photographers, videographers, actors, and models. Built with modern React patterns, Redux Toolkit for state management, and React Router v7 for navigation. Uses HTTP-only cookie authentication for enhanced security.

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

## Security Implementation (v1.1)

### HTTP-Only Cookie Authentication

- **Token Storage**: JWT tokens now stored in HTTP-only cookies set by backend
  - Old approach: `localStorage.token` (vulnerable to XSS)
  - New approach: HTTP-only, sameSite=strict cookie (inaccessible to JavaScript)
  - Automatic inclusion: Browser automatically includes cookie with requests (`credentials: 'include'`)

### Removed localStorage Token Storage

- No longer storing tokens in `localStorage`
- Only user profile data stored locally (non-sensitive information)
- Token lifecycle managed entirely by browser cookie handling

### API Communication Pattern

All API calls now use the `credentials: 'include'` pattern:

```javascript
// OLD (no longer used)
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}` // Token exposed in request header
  }
})

// NEW (current implementation)
fetch(url, {
  credentials: 'include' // Browser automatically includes HTTP-only cookie
})
```

### CSRF Protection

- Frontend can optionally retrieve CSRF tokens from `GET /csrf-token` endpoint
- Tokens can be included in request headers for state-changing operations
- Backend validates CSRF tokens for POST, PUT, DELETE requests

---

## Core Concepts

### Authentication Flow (Updated v1.1)

1. **Login Request** → User submits credentials on `/login`
2. **Dispatch Action** → `handleLogin()` dispatches `loginStart()`
3. **API Call** → POST to `{API_BASE_URL}/login` with username/password + `credentials: 'include'`
4. **Cookie Response** → Backend sets HTTP-only cookie with JWT token
5. **Store in Redux** → Dispatch `loginSuccess(user)` — note: no token in Redux
6. **Persist User Data** → Save user profile to `localStorage` only (not token)
7. **Redirect** → Navigate to `/home`
8. **Hydration on Reload** → `store.js` restores user from localStorage; token restored from cookie automatically

### State Management (Redux Toolkit)

**Auth Slice** (`store/authSlice.js`):

```javascript
{
  isLoggedIn: boolean,        // Authentication status
  user: {                     // Current user data
    id, username, email, role
  },
  token: null,                // Token NO LONGER STORED (in HTTP-only cookie instead)
  loading: boolean,           // Login/logout in progress
  error: string,              // Error message (if any)
  hydrationComplete: boolean  // Hydration from localStorage done
}
```

**Hydration Flow** (`store/store.js`):

- On app startup, restores user data from `localStorage` only
- Token is automatically included from HTTP-only cookie (transparent to JavaScript)
- Dispatches `loginSuccess()` if user data exists
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

### API Communication (Updated v1.1)

**BaseURL Resolution** (`utils/apiClient.js`):

- Reads `REACT_APP_API_BASE_URL` from `.env`
- Fallback: `http://localhost:8800` for local development

**Credential Inclusion** (HTTP-only Cookie Pattern):

```javascript
// All API calls now include credentials
fetch(url, {
  method: 'POST',
  credentials: 'include',  // Automatically includes HTTP-only cookie
  headers: {
    'Content-Type': 'application/json'
    // NO Authorization header needed
  },
  body: JSON.stringify(data)
})
```

**Token Not Injected By JavaScript**:

- Backend sends JWT in HTTP-only cookie during login
- Browser automatically includes cookie with all same-origin requests
- JavaScript cannot read or modify the token
- Provides XSS protection: stealing `document.cookie` cannot access auth token

**CSRF Token Handling** (Optional):

```javascript
// Retrieve CSRF token for protected operations
const csrfResponse = await fetch(`${API_BASE_URL}/csrf-token`, {
  credentials: 'include'
});
const { csrfToken } = await csrfResponse.json();

// Include in request header for POST/PUT/DELETE (optional, backend validates)
fetch(url, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'X-CSRF-Token': csrfToken
  }
})
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

## Components

### Core Components

**ProtectedRoute** (`Components/ProtectedRoute.jsx`)
- Wrapper component enforcing authentication
- Redirects to `/login` if not authenticated
- Checks `state.auth.isLoggedIn` before rendering children

**NavBar** (`Components/NavBar.js`)
- Top navigation with authenticated route links
- Logo + nav links (Home, Map, Profile)
- Logout button with callback handler
- Responsive design with flexbox layout

### Home Feed Components (New)

**Home** (`Pages/Home.jsx`)
- Main feed page integrating all feed components
- Manages loading/error states
- Conditionally renders CreatePostModal, FeedFilters, PostsFeed

**CreatePostModal** (`Components/CreatePostModal.jsx`)
- File upload form with preview
- Inputs: title, description, visibility, tags
- Drag-drop support for media files
- Dispatches `createPost` Redux thunk
- Shows success/error messages with auto-dismiss

**FeedFilters** (`Components/FeedFilters.jsx`)
- Dropdown filters: role (filter_by), media type, sort order
- Updates Redux `postsSlice.filters` on change
- Triggers feed refetch via `fetchFeedPosts`

**PostsFeed** (`Components/PostsFeed.jsx`)
- Infinite scroll pagination with Intersection Observer
- Renders array of `PostCard` components
- Auto-loads next page when user scrolls to bottom
- Shows loading indicator and "no posts" state

**PostCard** (`Components/PostCard.jsx`)
- Individual post display with:
  - User avatar (username + role badge)
  - Media preview (image/video thumbnail)
  - Post title and description
  - Tags list
  - Like/comment counters
  - Delete button (owner only)
- Responsive design with hover effects

### Redux State Management

**postsSlice** (`store/postsSlice.js`):
```javascript
{
  feed: {
    posts: [],          // Current page posts
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
    loading: false,
    error: null
  },
  createPostForm: {
    loading: false,
    success: false,
    error: null
  },
  filters: {
    filter_by: 'all',   // photographer|videographer|musician|artist|user|all
    media_type: 'all',  // photo|video|all
    sort: 'newest'      // newest|popular
  },
  currentPost: null,
  userPosts: []
}
```

**Async Thunks**:
- `fetchFeedPosts` - Paginated feed with filters
- `createPost` - Upload media + post metadata
- `deletePost` - Delete own posts
- `fetchPostById` - Get single post details
- `fetchUserPosts` - Get user's public posts

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
